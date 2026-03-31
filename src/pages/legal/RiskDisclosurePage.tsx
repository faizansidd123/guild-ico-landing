import LegalPage from "@/components/legal/LegalPage";
import { appText } from "@/content/app-text";

const RiskDisclosurePage = () => {
  const riskDisclosure = appText.legalDocuments.riskDisclosure;

  return (
    <LegalPage
      title={riskDisclosure.title}
      updatedAt={riskDisclosure.updatedAt}
      sections={riskDisclosure.sections}
    />
  );
};

export default RiskDisclosurePage;
