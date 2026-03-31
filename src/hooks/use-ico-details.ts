import { useQuery } from "@tanstack/react-query";

import { fetchIcoDetails } from "@/lib/ico-api";
import { QUERY_DEFAULTS } from "@/lib/query-defaults";

export const ICO_DETAILS_QUERY_KEY = ["ico-details"];

export const useIcoDetails = () => {
  return useQuery({
    queryKey: ICO_DETAILS_QUERY_KEY,
    queryFn: fetchIcoDetails,
    staleTime: QUERY_DEFAULTS.icoDetails.staleTime,
    refetchInterval: QUERY_DEFAULTS.icoDetails.refetchInterval,
  });
};
