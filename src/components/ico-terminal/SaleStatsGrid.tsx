import { appText } from "@/content/app-text";
import { ethAmountFormatter, numberFormatter, usdFormatter } from "@/lib/formatters";

type SaleStatsGridProps = {
  totalRaisedUsdt: number | null;
  totalRaisedUsdc: number | null;
  totalRaisedEth: number | null;
  softCap: number | null;
  hardCapUsd: number | null;
  soldTokens: number | null;
};

const stableAmountFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

const formatRaisedAmount = (value: number | null, symbol: "USDT" | "USDC" | "ETH") => {
  if (value === null) {
    return `-- ${symbol}`;
  }

  if (symbol === "ETH") {
    return `${ethAmountFormatter.format(value)} ETH`;
  }

  return `${stableAmountFormatter.format(value)} ${symbol}`;
};

const SaleStatsGrid = ({
  totalRaisedUsdt,
  totalRaisedUsdc,
  totalRaisedEth,
  softCap,
  hardCapUsd,
  soldTokens,
}: SaleStatsGridProps) => {
  const formatUsdOrPlaceholder = (value: number | null) => (value === null ? "--" : usdFormatter.format(value));
  const formatNumberOrPlaceholder = (value: number | null) => (value === null ? "--" : numberFormatter.format(value));
  const formatSoftCapOrPlaceholder = (value: number | null) =>
    value === null || value <= 0 ? "--" : numberFormatter.format(value);

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      <div>
        <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.fundsRaised}</p>
        <div className="space-y-0.5">
          <p className="font-mono font-bold text-accent tabular-nums text-[11px] leading-tight">
            {formatRaisedAmount(totalRaisedUsdt, "USDT")}
          </p>
          <p className="font-mono font-bold text-accent tabular-nums text-[11px] leading-tight">
            {formatRaisedAmount(totalRaisedUsdc, "USDC")}
          </p>
          <p className="font-mono font-bold text-accent tabular-nums text-[11px] leading-tight">
            {formatRaisedAmount(totalRaisedEth, "ETH")}
          </p>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.hardCap}</p>
        <p className="font-mono font-bold text-foreground tabular-nums text-sm">{formatUsdOrPlaceholder(hardCapUsd)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.tokensSold}</p>
        <p className="font-mono font-bold text-primary tabular-nums text-sm">{formatNumberOrPlaceholder(soldTokens)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.remaining}</p>
        <p className="font-mono font-bold text-muted-foreground tabular-nums text-sm">{formatSoftCapOrPlaceholder(softCap)}</p>
      </div>
    </div>
  );
};

export default SaleStatsGrid;
