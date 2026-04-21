import { appText } from "@/content/app-text";
import type { PaymentMethod } from "@/types/ico";

type AmountQuotePanelProps = {
  paymentMethod: PaymentMethod;
  payAmountDisplay: string;
  tokenAmountInput: string;
  isCalculating?: boolean;
  tokenSymbol: string;
  onTokenAmountInputChange: (value: string) => void;
};

const AmountQuotePanel = ({
  paymentMethod,
  payAmountDisplay,
  tokenAmountInput,
  isCalculating = false,
  tokenSymbol,
  onTokenAmountInputChange,
}: AmountQuotePanelProps) => {
  const payUnit = paymentMethod === "ETH" ? "ETH" : paymentMethod;
  const receiveUnit = tokenSymbol;

  return (
    <div className="space-y-1.5">
      <div className="bg-surface rounded-lg px-3 py-2.5 flex justify-between items-center" style={{ borderBottom: "2px solid rgba(0,180,200,0.3)" }}>
        <div>
          <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.youPay}</p>
          <p className="text-foreground font-mono font-bold text-base tabular-nums">{payAmountDisplay || "--"}</p>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{payUnit}</span>
      </div>

      <div className="bg-surface rounded-lg px-3 py-2.5 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.youReceive}</p>
          <input
            type="text"
            inputMode="decimal"
            value={tokenAmountInput}
            onChange={(event) => {
              const next = event.target.value;
              if (/^\d*\.?\d*$/.test(next)) {
                onTokenAmountInputChange(next);
              }
            }}
            className="bg-transparent text-foreground font-mono font-bold text-base w-32 outline-none tabular-nums"
          />
        </div>
        <span className="text-xs font-mono text-primary">{receiveUnit}</span>
      </div>

      {isCalculating ? (
        <p className="text-[10px] text-center text-muted-foreground font-mono inline-flex w-full items-center justify-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </p>
      ) : null}
    </div>
  );
};

export default AmountQuotePanel;
