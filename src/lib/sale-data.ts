import { saleConfig } from "@/config/sale";
import { fetchJson } from "@/lib/http-client";
import { toFiniteNumber } from "@/lib/number-utils";
import { throwToastedError } from "@/lib/error-feedback";

export type SaleStats = {
  tokenPriceUsd: number;
  tokensPerEth: number;
  raisedUsd: number;
  hardCapUsd: number;
  soldTokens: number;
  remainingTokens: number;
  progressPct: number;
  saleEndsAt: string;
};

const SALE_PROGRESS_KEY = "guild_sale_progress";

type LocalProgress = {
  raisedUsd: number;
  soldTokens: number;
};

const defaultProgress: LocalProgress = {
  raisedUsd: 1_200_000,
  soldTokens: 24_000_000,
};

const sanitizeProgress = (progress: LocalProgress): LocalProgress => {
  return {
    raisedUsd: Math.max(0, progress.raisedUsd),
    soldTokens: Math.max(0, progress.soldTokens),
  };
};

const getLocalProgress = (): LocalProgress => {
  try {
    const raw = localStorage.getItem(SALE_PROGRESS_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as LocalProgress;

    if (!Number.isFinite(parsed.raisedUsd) || !Number.isFinite(parsed.soldTokens)) {
      return defaultProgress;
    }

    return sanitizeProgress(parsed);
  } catch {
    return defaultProgress;
  }
};

const setLocalProgress = (progress: LocalProgress) => {
  localStorage.setItem(SALE_PROGRESS_KEY, JSON.stringify(sanitizeProgress(progress)));
};

const normalizeSaleStats = (payload: Partial<SaleStats>): SaleStats | null => {
  const raisedUsd = toFiniteNumber(payload.raisedUsd);
  const soldTokens = toFiniteNumber(payload.soldTokens);
  const hardCapUsd = toFiniteNumber(payload.hardCapUsd);

  if (raisedUsd === null || soldTokens === null || hardCapUsd === null) {
    return null;
  }

  const normalized: SaleStats = {
    tokenPriceUsd: Number(payload.tokenPriceUsd ?? saleConfig.tokenPriceUsd),
    tokensPerEth: Number(payload.tokensPerEth ?? saleConfig.tokensPerEth),
    raisedUsd,
    hardCapUsd,
    soldTokens,
    remainingTokens: Number(payload.remainingTokens ?? saleConfig.totalTokensForSale - soldTokens),
    progressPct: Number(payload.progressPct ?? (raisedUsd / hardCapUsd) * 100),
    saleEndsAt: payload.saleEndsAt || saleConfig.saleEndsAt,
  };

  return {
    ...normalized,
    remainingTokens: Math.max(0, normalized.remainingTokens),
    progressPct: Math.min(100, Math.max(0, normalized.progressPct)),
  };
};

const makeStatsFromProgress = (progress: LocalProgress): SaleStats => {
  const safeProgress = sanitizeProgress(progress);
  const remainingTokens = Math.max(0, saleConfig.totalTokensForSale - safeProgress.soldTokens);
  const progressPct = Math.min(100, (safeProgress.raisedUsd / saleConfig.hardCapUsd) * 100);

  return {
    tokenPriceUsd: saleConfig.tokenPriceUsd,
    tokensPerEth: saleConfig.tokensPerEth,
    raisedUsd: safeProgress.raisedUsd,
    hardCapUsd: saleConfig.hardCapUsd,
    soldTokens: safeProgress.soldTokens,
    remainingTokens,
    progressPct,
    saleEndsAt: saleConfig.saleEndsAt,
  };
};

export const fetchSaleStats = async (): Promise<SaleStats> => {
  if (saleConfig.saleApiUrl) {
    try {
      const payload = await fetchJson<Partial<SaleStats>>(saleConfig.saleApiUrl, {
        method: "GET",
        timeoutMs: 15_000,
        retries: 1,
      });

      const normalized = normalizeSaleStats(payload);
      if (normalized) {
        return normalized;
      }
    } catch (error) {
      throwToastedError(
        error instanceof Error ? error.message : "Sale API request failed",
      );
    }
  }

  return makeStatsFromProgress(getLocalProgress());
};

export const recordLocalContribution = (ethAmount: number, tokenAmount: number): SaleStats => {
  const progress = getLocalProgress();
  const updated: LocalProgress = {
    raisedUsd: progress.raisedUsd + ethAmount * saleConfig.tokensPerEth * saleConfig.tokenPriceUsd,
    soldTokens: progress.soldTokens + tokenAmount,
  };
  setLocalProgress(updated);
  return makeStatsFromProgress(updated);
};
