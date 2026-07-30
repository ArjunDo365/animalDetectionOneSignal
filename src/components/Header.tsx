// src/components/Header.tsx
// App header with title + logout button (shown on protected pages).

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden="true">
          A
        </span>
        <span>Animals Directory</span>
      </div>
      <div className="app-header__right">
        {user && (
          <span className="app-header__user">
            {user.firstName} {user.lastName}
          </span>
        )}
        <button className="btn btn-dark" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
