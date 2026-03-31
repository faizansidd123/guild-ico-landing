import { appText } from "@/content/app-text";

type SaleProgressProps = {
  progressPct: number | null;
};

const SaleProgress = ({ progressPct }: SaleProgressProps) => {
  const hasProgress = progressPct !== null && Number.isFinite(progressPct);
  const safeProgressPct = hasProgress ? Math.max(0, Math.min(100, progressPct)) : 0;
  const progressLabel = hasProgress ? `${safeProgressPct.toFixed(2)}${appText.icoTerminal.labels.soldSuffix}` : "--";

  return (
    <div className="space-y-1.5">
      <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${safeProgressPct}%`,
            background: "linear-gradient(135deg, #00F5FF 0%, #00FFA3 100%)",
          }}
        />
      </div>
      <p className="text-center text-[11px] font-mono text-muted-foreground">
        {progressLabel}
      </p>
    </div>
  );
};

export default SaleProgress;
