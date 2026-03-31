import { appText } from "@/content/app-text";
import { numberFormatter, usdFormatter } from "@/lib/formatters";

type SaleStatsGridProps = {
  raisedUsd: number | null;
  hardCapUsd: number | null;
  soldTokens: number | null;
  remainingTokens: number | null;
};

const SaleStatsGrid = ({ raisedUsd, hardCapUsd, soldTokens, remainingTokens }: SaleStatsGridProps) => {
  const formatUsdOrPlaceholder = (value: number | null) => (value === null ? "--" : usdFormatter.format(value));
  const formatNumberOrPlaceholder = (value: number | null) => (value === null ? "--" : numberFormatter.format(value));

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      <div>
        <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.fundsRaised}</p>
        <p className="font-mono font-bold text-accent tabular-nums text-sm">{formatUsdOrPlaceholder(raisedUsd)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.hardCap}</p>
        <p className="font-mono font-bold text-foreground tabular-nums text-sm">{formatUsdOrPlaceholder(hardCapUsd)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.tokensSold}</p>
        <p className="font-mono font-bold text-primary tabular-nums text-sm">{formatNumberOrPlaceholder(soldTokens)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-mono uppercase">{appText.icoTerminal.labels.remaining}</p>
        <p className="font-mono font-bold text-muted-foreground tabular-nums text-sm">{formatNumberOrPlaceholder(remainingTokens)}</p>
      </div>
    </div>
  );
};

export default SaleStatsGrid;
