import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-[100dvh] bg-[#f4f1fb]">
      <div className="pb-28">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
