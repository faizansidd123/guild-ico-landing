import { appText } from "@/content/app-text";
import type { CountdownState } from "@/hooks/use-countdown";

type CountdownUnitProps = { value: string; label: string };

const CountdownUnit = ({ value, label }: CountdownUnitProps) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="relative bg-surface rounded-lg px-1.5 py-1 font-mono text-lg lg:text-xl font-bold text-primary tabular-nums min-w-[2.5rem] text-center overflow-hidden">
      {value}
      <div className="absolute inset-x-0 top-1/2 h-px bg-background/50" />
    </div>
    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wide">{label}</span>
  </div>
);

type CountdownDisplayProps = {
  countdown: CountdownState;
  label: string;
};

const CountdownDisplay = ({ countdown, label }: CountdownDisplayProps) => {
  return (
    <div className="space-y-1.5">
      <p className="text-center text-[10px] font-mono uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex justify-center gap-1.5">
        <CountdownUnit value={String(countdown.d).padStart(2, "0")} label={appText.icoTerminal.labels.countdown.days} />
        <span className="text-muted-foreground font-mono text-lg self-start mt-1">:</span>
        <CountdownUnit value={String(countdown.h).padStart(2, "0")} label={appText.icoTerminal.labels.countdown.hours} />
        <span className="text-muted-foreground font-mono text-lg self-start mt-1">:</span>
        <CountdownUnit value={String(countdown.m).padStart(2, "0")} label={appText.icoTerminal.labels.countdown.mins} />
        <span className="text-muted-foreground font-mono text-lg self-start mt-1">:</span>
        <CountdownUnit value={String(countdown.s).padStart(2, "0")} label={appText.icoTerminal.labels.countdown.secs} />
      </div>
    </div>
  );
};

export default CountdownDisplay;
