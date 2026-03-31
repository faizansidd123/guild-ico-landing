import LegalPage from "@/components/legal/LegalPage";
import { appText } from "@/content/app-text";

const CookiesPage = () => {
  const cookies = appText.legalDocuments.cookies;

  return (
    <LegalPage
      title={cookies.title}
      updatedAt={cookies.updatedAt}
      sections={cookies.sections}
    />
  );
};

export default CookiesPage;
