import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";
import { useAppDispatch } from "@/store/hooks";
import { disconnectWallet, refreshWallet } from "@/store/walletSlice";

const WalletSync = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(refreshWallet());

    const provider = window.ethereum;
    if (!provider?.on || !provider?.removeListener) {
      return;
    }

    const onAccountsChanged = () => {
      void dispatch(refreshWallet());
    };

    const onChainChanged = () => {
      void dispatch(refreshWallet());
    };

    const onDisconnect = () => {
      dispatch(disconnectWallet());
      trackEvent("wallet_disconnected");
    };

    provider.on("accountsChanged", onAccountsChanged);
    provider.on("chainChanged", onChainChanged);
    provider.on("disconnect", onDisconnect);

    return () => {
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
      provider.removeListener?.("disconnect", onDisconnect);
    };
  }, [dispatch]);

  return null;
};

export default WalletSync;
