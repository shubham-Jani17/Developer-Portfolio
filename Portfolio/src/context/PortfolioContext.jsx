import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchPortfolio } from "../api/client";
import { getStaticPortfolio, normalizePortfolio } from "../data/staticPortfolio";
import { resolveHeroImage } from "../utils/heroImage";

const PortfolioContext = createContext(null);

function withHeroImage(portfolio) {
  if (!portfolio) return portfolio;
  return {
    ...portfolio,
    hero: {
      ...portfolio.hero,
      image: resolveHeroImage(portfolio.hero?.image),
    },
  };
}

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState(() => withHeroImage(getStaticPortfolio()));
  const [loading, setLoading] = useState(false);
  const [fromApi, setFromApi] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchPortfolio();
      setPortfolio(withHeroImage(normalizePortfolio(data)));
      setFromApi(true);
    } catch {
      setPortfolio(withHeroImage(getStaticPortfolio()));
      setFromApi(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("portfolio-updated", onUpdate);

    // Cross-tab real-time update listener
    const bc = new BroadcastChannel("portfolio-channel");
    bc.onmessage = (event) => {
      if (event.data === "updated") {
        load();
      }
    };

    return () => {
      window.removeEventListener("portfolio-updated", onUpdate);
      bc.close();
    };
  }, [load]);

  const value = useMemo(
    () => ({ portfolio, loading, fromApi, reload: load }),
    [portfolio, loading, fromApi, load]
  );

  return (
    <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
