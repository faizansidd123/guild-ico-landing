import { useQuery } from "@tanstack/react-query";

import { QUERY_DEFAULTS } from "@/lib/query-defaults";
import { fetchSaleStats } from "@/lib/sale-data";

export const SALE_STATS_QUERY_KEY = ["sale-stats"];

export const useSaleStats = () => {
  return useQuery({
    queryKey: SALE_STATS_QUERY_KEY,
    queryFn: fetchSaleStats,
    refetchInterval: QUERY_DEFAULTS.saleStats.refetchInterval,
    staleTime: QUERY_DEFAULTS.saleStats.staleTime,
  });
};
