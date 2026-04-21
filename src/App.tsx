import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { captureReferralFromUrl, trackPageView } from "@/lib/analytics";
import { store } from "@/store";
import { AlchemyAccountKitProvider } from "@/providers/alchemyAccountKitProvider";
import { MoonPayProviderWrapper } from "@/providers/moonpayProvider";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import RiskDisclosurePage from "./pages/legal/RiskDisclosurePage.tsx";
import CookiesPage from "./pages/legal/CookiesPage.tsx";
import { useEffect } from "react";

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
};

const App = () => (
  <AlchemyAccountKitProvider>
    <MoonPayProviderWrapper>
      <Provider store={store}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/legal/risk-disclosure" element={<RiskDisclosurePage />} />
              <Route path="/legal/cookies" element={<CookiesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </Provider>
    </MoonPayProviderWrapper>
  </AlchemyAccountKitProvider>
);

export default App;
