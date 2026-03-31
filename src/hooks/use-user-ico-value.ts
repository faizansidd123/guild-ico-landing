import { useQuery } from "@tanstack/react-query";

import { fetchUserIcoValue } from "@/lib/ico-api";
import { QUERY_DEFAULTS } from "@/lib/query-defaults";

type UseUserIcoValueParams = {
  walletAddress?: string;
};

export const USER_ICO_VALUE_QUERY_KEY = ["user-ico-value"];

export const useUserIcoValue = ({ walletAddress }: UseUserIcoValueParams) => {
  const normalizedWalletAddress = (walletAddress || "").trim();

  return useQuery({
    queryKey: [...USER_ICO_VALUE_QUERY_KEY, normalizedWalletAddress],
    queryFn: () =>
      fetchUserIcoValue({
        walletAddress: normalizedWalletAddress,
      }),
    enabled: normalizedWalletAddress.length > 0,
    staleTime: QUERY_DEFAULTS.userIcoValue.staleTime,
    refetchInterval: QUERY_DEFAULTS.userIcoValue.refetchInterval,
  });
};
