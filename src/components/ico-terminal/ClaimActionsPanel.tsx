import { motion } from "framer-motion";

import type { ClaimAction } from "@/components/ico-terminal/types";
import { appText } from "@/content/app-text";

type ClaimActionsPanelProps = {
  actions: ClaimAction[];
  claimableAmounts?: Partial<Record<ClaimAction, string>>;
  disabled: boolean;
  onClaim: (action: ClaimAction) => void;
};

const CLAIM_ACTION_STYLES: Record<ClaimAction, string> = {
  claimToken: "border-primary/40 text-primary",
  claimRefund: "border-border text-foreground",
  claimRefundStable: "border-border text-foreground",
};

const CLAIM_ACTION_LABELS: Record<ClaimAction, string> = {
  claimToken: appText.icoTerminal.claimActions.claimToken,
  claimRefund: appText.icoTerminal.claimActions.claimRefund,
  claimRefundStable: appText.icoTerminal.claimActions.claimRefundStable,
};

const ClaimActionsPanel = ({ actions, claimableAmounts, disabled, onClaim }: ClaimActionsPanelProps) => {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <motion.button
          key={action}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full py-2.5 rounded-lg border font-mono text-xs tracking-wider disabled:opacity-60 disabled:cursor-not-allowed ${CLAIM_ACTION_STYLES[action]}`}
          onClick={() => onClaim(action)}
          disabled={disabled}
        >
          <span className="block">{CLAIM_ACTION_LABELS[action]}</span>
          {claimableAmounts?.[action] ? (
            <span className="mt-1 block text-[10px] tracking-normal text-muted-foreground tabular-nums">
              Claimable: {claimableAmounts[action]}
            </span>
          ) : null}
        </motion.button>
      ))}
    </div>
  );
};

export default ClaimActionsPanel;
