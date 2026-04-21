import { Link } from "react-router-dom";
import { appText } from "@/content/app-text";

type LegalSection = {
  heading: string;
  body: string;
};

type LegalPageProps = {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
};

const LegalPage = ({ title, updatedAt, sections }: LegalPageProps) => {
  return (
    <main className="min-h-screen gradient-bg py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link to="/" className="text-sm text-primary hover:underline">{appText.legalPage.backToHome}</Link>
        <article className="glass-surface rounded-2xl p-8 mt-4">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {appText.legalPage.lastUpdatedPrefix} {updatedAt}
          </p>

          <div className="space-y-8 mt-8">
            {sections.map((section, index) => (
              <section key={`${section.heading}-${index}`}>
                <h2 className="text-xl font-semibold mb-2">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.body}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
};

export default LegalPage;
