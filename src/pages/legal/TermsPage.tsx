import LegalPage from "@/components/legal/LegalPage";
import { appText } from "@/content/app-text";

const TermsPage = () => {
  const terms = appText.legalDocuments.terms;

  return (
    <LegalPage
      title={terms.title}
      updatedAt={terms.updatedAt}
      sections={terms.sections}
    />
  );
};

export default TermsPage;
