import { motion } from "framer-motion";

type WalletActionButtonProps = {
  label: string;
  onClick: () => void;
  disabled: boolean;
};

const WalletActionButton = ({ label, onClick, disabled }: WalletActionButtonProps) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full rounded-lg border border-primary/40 bg-primary/5 px-3 py-2.5 font-mono text-xs tracking-wider text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </motion.button>
  );
};

export default WalletActionButton;
