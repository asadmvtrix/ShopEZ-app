import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthProvider";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label="Checking sign-in" />
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?mode=login&redirect=${redirect}`} replace />;
  }

  return children;
}
