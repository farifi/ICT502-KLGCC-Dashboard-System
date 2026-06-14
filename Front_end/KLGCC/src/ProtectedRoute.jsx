import { Navigate } from "react-router-dom";
import { useAuth } from "./API Contexts Folder/AuthContext"; // adjust path if needed

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  // Optionally you can render a loader here while we check the session
  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/LandingPage" replace />;
  }

  return children;
};

export default ProtectedRoute;