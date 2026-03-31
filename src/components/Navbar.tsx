import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import guildLogo from "@/assets/guild_Main_Logo_trans.png";
import WalletDashboardModal from "@/components/WalletDashboardModal";
import { appText } from "@/content/app-text";
import { navLinks } from "@/content/landing-content";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { trackEvent } from "@/lib/analytics";
import { toast } from "@/components/ui/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const {
    isConnected,
    connectedAddress,
    shortAddress,
    chainId,
    balanceEth,
    isConnecting,
    sendGaslessTransaction,
    connectWallet,
    disconnectWallet,
    walletError,
  } = useWalletAuth();
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    if (connectedAddress && !wasConnectedRef.current) {
      trackEvent("wallet_connected", { account: connectedAddress });
      toast({
        title: appText.navbar.wallet.connectedToastTitle,
        description: appText.navbar.wallet.connectedToastDescription,
      });
    }

    wasConnectedRef.current = Boolean(connectedAddress);
  }, [connectedAddress]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 inset-x-0 z-50 glass-surface"
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <a href="/" aria-label={appText.navbar.homeAriaLabel}>
            <img src={guildLogo} alt={appText.common.brandName} className="h-6" />
          </a>

          <button
            type="button"
            className="md:hidden text-foreground"
            onClick={() => setIsOpen((current) => !current)}
            aria-label={appText.navbar.menuToggleAriaLabel}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </a>
            ))}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,245,255,0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-semibold tracking-wider"
              onClick={() => setIsWalletModalOpen(true)}
            >
              {isConnecting
                ? appText.navbar.wallet.connectingCompact
                : shortAddress
                  ? shortAddress
                  : appText.navbar.wallet.connectCompact}
            </motion.button>
          </div>
        </div>

        {isOpen ? (
          <div className="md:hidden mt-4 pb-2 flex flex-col gap-2 text-sm text-muted-foreground">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-1 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isConnected && connectedAddress ? (
              <button
                type="button"
                className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-semibold tracking-wider"
                onClick={() => setIsWalletModalOpen(true)}
              >
                {shortAddress}
              </button>
            ) : (
              <button
                type="button"
                className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-semibold tracking-wider"
                onClick={() => setIsWalletModalOpen(true)}
              >
                {isConnecting ? appText.navbar.wallet.connectingCompact : appText.navbar.wallet.connectWallet}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <WalletDashboardModal
        open={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
        isConnected={isConnected}
        isConnecting={isConnecting}
        connectedAddress={connectedAddress}
        shortAddress={shortAddress}
        chainId={chainId}
        balanceEth={balanceEth}
        walletError={walletError}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        sendGaslessTransaction={sendGaslessTransaction}
      />
    </motion.nav>
  );
};

export default Navbar;
