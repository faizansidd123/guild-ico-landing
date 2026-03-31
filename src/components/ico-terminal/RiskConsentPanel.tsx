import { appText } from "@/content/app-text";
import { Checkbox } from "@/components/ui/checkbox";

type RiskConsentPanelProps = {
  acceptedRisk: boolean;
  acceptedTerms: boolean;
  onRiskChange: (next: boolean) => void;
  onTermsChange: (next: boolean) => void;
};

const RiskConsentPanel = ({
  acceptedRisk,
  acceptedTerms,
  onRiskChange,
  onTermsChange,
}: RiskConsentPanelProps) => {
  return (
    <div className="space-y-2 rounded-xl bg-surface p-3">
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <Checkbox checked={acceptedRisk} onCheckedChange={(checked) => onRiskChange(Boolean(checked))} />
        {appText.icoTerminal.riskStatements.volatility}
      </label>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <Checkbox checked={acceptedTerms} onCheckedChange={(checked) => onTermsChange(Boolean(checked))} />
        {appText.icoTerminal.riskStatements.terms}
      </label>
    </div>
  );
};

export default RiskConsentPanel;
