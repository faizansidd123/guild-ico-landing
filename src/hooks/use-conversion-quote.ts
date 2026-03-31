import { useQuery } from "@tanstack/react-query";

import { fetchConversionQuote } from "@/lib/ico-api";
import { QUERY_DEFAULTS } from "@/lib/query-defaults";
import { roundTo } from "@/lib/number-utils";
import type { PaymentMethod } from "@/types/ico";

type UseConversionQuoteParams = {
  amount: number;
  paymentMethod: PaymentMethod;
  amountType?: "pay" | "token";
  enabled?: boolean;
};

export const CONVERSION_QUOTE_QUERY_KEY = ["conversion-quote"];

export const useConversionQuote = ({ amount, paymentMethod, amountType = "pay", enabled = true }: UseConversionQuoteParams) => {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;

  return useQuery({
    queryKey: [...CONVERSION_QUOTE_QUERY_KEY, paymentMethod, amountType, roundTo(safeAmount, 8)],
    queryFn: () =>
      fetchConversionQuote({
        amount: safeAmount,
        paymentMethod,
        amountType,
      }),
    enabled: enabled && safeAmount > 0,
    staleTime: QUERY_DEFAULTS.conversionQuote.staleTime,
    refetchInterval: QUERY_DEFAULTS.conversionQuote.refetchInterval,
  });
};
