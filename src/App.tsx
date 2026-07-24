// src/App.tsx
//
// Router + OneSignal notification-click deep-link handling.
//
// Deep-link flow:
//   - If the app is already open, a notification click fires the OneSignal
//     'notificationClick' event. We registered a handler in main.tsx that
//     calls `navigate()` via the ref exposed here — so we route in-app
//     without a full reload.
//   - If the app was closed, OneSignal/the SW opens the PWA at the deep-link
//     URL (e.g. /employees/3). The normal router + ProtectedRoute handles it:
//     not logged in → /login (stashing the intended path) → back after login.

import { useEffect, useRef } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
// import EmployeeList from "./pages/EmployeeList";
// import EmployeeDetail from "./pages/EmployeeDetail";
import { setDeepLinkNavigator } from "./services/notificationService";
import AnimalDetail from "./pages/AnimalDetail";

// Inner component that owns the navigate() function and hands it to the
// notification service so the click listener can route in-app.
function DeepLinkBridge({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const ready = useRef(false);

  useEffect(() => {
    if (ready.current) return;
    ready.current = true;
    setDeepLinkNavigator((path: string) => navigate(path));
  }, [navigate]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <DeepLinkBridge>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Routes nested here render inside AppLayout, which shows the
                persistent bottom nav (Reports / Dashboard / Profile).
                ProtectedRoute wraps the whole group so none of these are
                reachable without being logged in. */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/animals/:id" element={<AnimalDetail />} />
              {/* <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} /> */}
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DeepLinkBridge>
      </BrowserRouter>
    </AuthProvider>
  );
}
