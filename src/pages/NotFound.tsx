import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { appText } from "@/content/app-text";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(appText.notFound.routeErrorPrefix, location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{appText.notFound.code}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{appText.notFound.title}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {appText.notFound.returnHome}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
