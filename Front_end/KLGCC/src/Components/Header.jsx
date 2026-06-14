import { Menu } from "lucide-react";

import GlassCard from "./GlassCard";
import "./Components CSS files/Header.css";
import { useAuth } from "../API Contexts Folder/AuthContext";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <div className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1>Dashboard</h1>
      </div>
      <GlassCard className="profile">
        <span>{user?.email || "User"}</span>
      </GlassCard>
    </div>
  );
};

export default Header;
