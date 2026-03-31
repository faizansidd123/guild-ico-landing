import { motion } from "framer-motion";

type AcquireButtonProps = {
  ctaLabel: string;
  onClick: () => void;
  disabled: boolean;
};

const AcquireButton = ({ ctaLabel, onClick, disabled }: AcquireButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,245,255,0.5)" }}
      whileTap={{ scale: 0.98 }}
      className="relative flex w-full min-h-10 items-center justify-center overflow-hidden rounded-xl px-3 py-2.5 text-center text-sm font-bold leading-none tracking-wide text-primary-foreground shimmer animate-pulse-glow disabled:cursor-not-allowed disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #00F5FF 0%, #00FFA3 100%)" }}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10 block">{ctaLabel}</span>
    </motion.button>
  );
};

export default AcquireButton;
