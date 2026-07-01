import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../Spinner";

export default function RequireAuth({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children ?? <Outlet />;
}
