import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Upload, Settings, PieChart, LogOut, Calendar } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Upload", path: "/upload", icon: Upload },
  { name: "Vagtplan", path: "/schedule", icon: Calendar },
  { name: "Analysis", path: "/analysis", icon: PieChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className="relative w-full max-w-xs min-h-screen flex flex-col items-stretch px-0 py-0 font-sans overflow-hidden"
      style={{
        background: "#3063A8",
        borderTopRightRadius: '64px',
        borderBottomRightRadius: '48px',
        boxShadow: '0 4px 32px rgba(37,99,235,0.10)'
      }}
    >
      {/* Dekorativ grafik baggrund */}
      <svg className="absolute left-[-60px] bottom-[-80px] w-[300px] h-[300px] opacity-10 pointer-events-none select-none" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="150" cy="150" r="150" fill="#fff" />
      </svg>
      <svg className="absolute right-[-80px] top-[-60px] w-[220px] h-[220px] opacity-10 pointer-events-none select-none" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="110" cy="110" r="110" fill="#fff" />
      </svg>
      {/* Logo */}
      <div className="flex flex-col gap-4 px-8 pt-8 pb-4 z-10">
        <div className="flex items-center gap-2 mb-2">
          <img src="/paytjek-logo-white-blue-bg-72-512x512.png" alt="Paytjek Logo" className="h-10 w-auto rounded" />
          <span className="text-3xl font-extrabold tracking-tight text-white">PayTjek</span>
        </div>
      </div>
      {/* Menu */}
      <nav className="flex flex-col gap-4 px-6 pt-2 pb-8 flex-1 z-10">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-4 px-2 py-3 rounded-2xl transition text-left w-full text-xl font-bold
              ${location.pathname === item.path ? "bg-white shadow-lg text-[#2563eb]" : "bg-transparent text-white opacity-90 hover:bg-blue-400 hover:text-white"}
            `}
            style={{fontSize: '1.25rem'}}
          >
            <item.icon className={`w-7 h-7 ${location.pathname === item.path ? 'text-[#2563eb]' : 'text-white opacity-90'}`} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      {/* Logout nederst */}
      <div className="px-8 pb-8 pt-4 z-10 mt-auto">
        <button className="flex items-center text-white font-semibold text-lg hover:underline opacity-90" onClick={() => {/* TODO: implementer logout */}}>
          <LogOut className="h-6 w-6 mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
