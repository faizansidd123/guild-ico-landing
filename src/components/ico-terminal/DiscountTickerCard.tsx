import { appText } from "@/content/app-text";
import type { CountdownState } from "@/hooks/use-countdown";
import { usdFormatter } from "@/lib/formatters";

type DiscountTickerCardProps = {
  currentDiscountPct: number;
  preIcoAllocationUsd: number;
  publicSupplyUsd: number;
  countdown: CountdownState | null;
};

const DiscountTickerCard = ({
  currentDiscountPct,
  preIcoAllocationUsd,
  publicSupplyUsd,
  countdown,
}: DiscountTickerCardProps) => {
  return (
    <div className="rounded-lg border border-primary/20 bg-surface p-3">
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
        <span className="text-muted-foreground">{appText.icoTerminal.labels.preIcoDiscount}</span>
        <span className="text-accent font-bold">{currentDiscountPct.toFixed(0)}% off</span>
      </div>
      <p className="mt-1 text-[10px] font-mono text-muted-foreground">
        {usdFormatter.format(preIcoAllocationUsd)} {appText.icoTerminal.labels.preIcoAvailableSuffix} • {appText.icoTerminal.labels.publicSupplyPrefix} {usdFormatter.format(publicSupplyUsd)}
      </p>
      {countdown ? (
        <p className="mt-1 text-[10px] font-mono text-primary">
          {appText.icoTerminal.labels.discountTickerPrefix} {String(countdown.d).padStart(2, "0")}:
          {String(countdown.h).padStart(2, "0")}:
          {String(countdown.m).padStart(2, "0")}:
          {String(countdown.s).padStart(2, "0")}
        </p>
      ) : null}
    </div>
  );
};

export default DiscountTickerCard;
