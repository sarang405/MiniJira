import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem('access_token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  return children;
};

export default ProtectedRoute;