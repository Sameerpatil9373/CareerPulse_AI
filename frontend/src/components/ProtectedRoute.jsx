import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();

  // Based on your Login.jsx, we check if the "user" object exists in localStorage
  const user = localStorage.getItem("user");
  const isAuthenticated = user !== null && user !== undefined;

  // If the user is NOT logged in, redirect them to the login page.
  // We pass the route they were trying to access in 'state.from'
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If they are logged in, render the protected component
  return <Outlet />;
};

export default ProtectedRoute;