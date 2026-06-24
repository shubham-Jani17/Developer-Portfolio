import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { checkAdminSession } from "../api/client";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "denied"

  useEffect(() => {
    checkAdminSession()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "checking") {
    // Show a minimal loader while verifying the cookie
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-xs text-muted-foreground font-mono-display tracking-widest uppercase animate-pulse">
          Verifying session…
        </span>
      </div>
    );
  }

  if (status === "denied") return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
