import { useEffect } from "react";
import { recordPortfolioView } from "../api/client";

const VISITOR_KEY = "portfolio-visitor-id";
const SESSION_KEY = "portfolio-visit-recorded";

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** Count one visit per browser tab session when the public portfolio opens. */
export default function useRecordVisit() {
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const visitorId = getVisitorId();
    recordPortfolioView(visitorId)
      .then(() => sessionStorage.setItem(SESSION_KEY, "1"))
      .catch(() => {
        /* API offline — skip silently */
      });
  }, []);
}
