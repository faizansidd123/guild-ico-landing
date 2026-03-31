import LegalPage from "@/components/legal/LegalPage";
import { appText } from "@/content/app-text";

const PrivacyPage = () => {
  const privacy = appText.legalDocuments.privacy;

  return (
    <LegalPage
      title={privacy.title}
      updatedAt={privacy.updatedAt}
      sections={privacy.sections}
    />
  );
};

export default PrivacyPage;
