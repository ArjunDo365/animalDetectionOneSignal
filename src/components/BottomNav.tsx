import { NavLink } from "react-router-dom";
import { FileText, LayoutDashboard, User } from "lucide-react";

const navItems = [
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
      <div className="flex items-center justify-between bg-white rounded-3xl shadow-lg border border-gray-200 px-2 py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 rounded-2xl transition-colors ${
                isActive ? "bg-indigo-100" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-5 h-5 mb-1 ${
                    isActive ? "text-indigo-700" : "text-gray-500"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs ${
                    isActive ? "font-semibold text-indigo-700" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
