import { motion } from "framer-motion";

import type { PaymentMethodOption } from "@/components/ico-terminal/types";

type PaymentMethodTabsProps = {
  paymentMethod: PaymentMethodOption;
  options: readonly PaymentMethodOption[];
  onSelect: (method: PaymentMethodOption) => void;
};

const PaymentMethodTabs = ({ paymentMethod, options, onSelect }: PaymentMethodTabsProps) => {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {options.map((method) => (
        <motion.button
          key={method}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(method)}
          className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
            paymentMethod === method
              ? "bg-primary/10 text-primary neon-border"
              : "bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          {method}
        </motion.button>
      ))}
    </div>
  );
};

export default PaymentMethodTabs;
