import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPortfolio, savePortfolio } from "../api/client";
import { normalizePortfolio } from "../data/staticPortfolio";

const FEEDBACK_MS = 2800;

export default function useAdminPortfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const portfolioRef = useRef(null);
  const saveLockRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [savingScope, setSavingScope] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cardFeedback, setCardFeedback] = useState({ scope: null, message: "", error: "" });

  useEffect(() => {
    portfolioRef.current = portfolio;
  }, [portfolio]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPortfolio(true);
      setPortfolio(normalizePortfolio(data));
    } catch (e) {
      setError(e.message || "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (scope = "page", dataToSave = null) => {
    if (typeof scope !== "string") scope = "page";
    const data = dataToSave || portfolioRef.current;
    if (!data || saveLockRef.current) return;

    saveLockRef.current = true;
    setSavingScope(scope);
    setError("");
    setMessage("");
    setCardFeedback({ scope, message: "Saving…", error: "" });

    try {
      await savePortfolio(data);
      const ok = { scope, message: "Saved successfully", error: "" };
      setCardFeedback(ok);
      if (scope === "page") setMessage("Saved successfully");
      window.dispatchEvent(new Event("portfolio-updated"));
      try {
        const bc = new BroadcastChannel("portfolio-channel");
        bc.postMessage("updated");
        bc.close();
      } catch (e) {
        console.warn("BroadcastChannel failed:", e);
      }
      setTimeout(() => {
        setCardFeedback((f) => (f.scope === scope ? { scope: null, message: "", error: "" } : f));
        if (scope === "page") setMessage("");
      }, FEEDBACK_MS);
    } catch (e) {
      const errText = e.message || "Save failed";
      setCardFeedback({ scope, message: "", error: errText });
      if (scope === "page") setError(errText);
    } finally {
      saveLockRef.current = false;
      setSavingScope(null);
    }
  }, []);

  const isSaving = (scope) => savingScope === scope;
  const cardStatus = (scope) =>
    cardFeedback.scope === scope
      ? { message: cardFeedback.message, error: cardFeedback.error }
      : { message: "", error: "" };

  return {
    portfolio,
    loading,
    saving: savingScope !== null,
    savingScope,
    message,
    error,
    setPortfolio,
    save,
    isSaving,
    cardStatus,
    reload: load,
  };
}
