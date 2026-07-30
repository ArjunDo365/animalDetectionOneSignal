// src/components/ProtectedRoute.tsx
//
// Wraps protected pages. If the user isn't logged in we redirect to /login,
// stashing the location they tried to reach in router state so the login page
// can send them back after a successful login (redirect-back-after-login).

import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
