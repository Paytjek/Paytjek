import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Upload, Settings, PieChart, LogOut, Calendar, HelpCircle, User, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, translation: "common.dashboard" },
    { name: "Upload", path: "/upload", icon: Upload, translation: "common.upload" },
    { name: "Vagtplan", path: "/schedule", icon: Calendar, translation: "schedule.title" },
    { name: "Analyse", path: "/analysis", icon: BarChart3, translation: "common.analysis" },
    { name: "Indstillinger", path: "/settings", icon: Settings, translation: "common.settings" },
  ];

  return (
    <aside
      className="relative w-full max-w-xs min-h-screen flex flex-col items-stretch px-0 py-0 font-sans overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
        borderTopRightRadius: '32px',
        borderBottomRightRadius: '32px',
        boxShadow: '0 4px 32px rgba(37,99,235,0.15)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -left-10 -bottom-20 w-64 h-64 rounded-full bg-white blur-xl"></div>
        <div className="absolute -right-10 -top-20 w-48 h-48 rounded-full bg-white blur-xl"></div>
        <div className="absolute right-1/4 bottom-1/3 w-24 h-24 rounded-full bg-white blur-lg"></div>
      </div>
      
      {/* Logo and Company Name */}
      <div className="relative flex flex-col gap-4 px-8 pt-8 pb-10 z-10">
        <div className="flex items-center gap-3">
          <img src="/paytjek-logo-white-blue-bg-72-512x512.png" alt="Paytjek Logo" className="h-12 w-auto rounded-lg shadow-md" />
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tight text-white">PayTjek</span>
            <span className="text-xs text-blue-100 font-medium">Lønseddel Analyse Platform</span>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="relative flex flex-col gap-2 px-6 pt-2 pb-8 flex-1 z-10">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition duration-200 text-left w-full ${
              location.pathname === item.path 
                ? "bg-white shadow-lg text-blue-700 font-bold" 
                : "bg-transparent text-white hover:bg-blue-500/30 font-medium"
            }`}
          >
            <item.icon className={`w-5 h-5 ${
              location.pathname === item.path ? 'text-blue-700' : 'text-blue-100'
            }`} />
            <span>{t(item.translation)}</span>
            
            {location.pathname === item.path && (
              <div className="ml-auto w-1.5 h-6 bg-blue-700 rounded-full"></div>
            )}
          </button>
        ))}
      </nav>
      
      {/* Support and Logout Section */}
      <div className="relative px-6 pb-8 pt-4 z-10 mt-auto space-y-3">
        <button className="flex items-center gap-3.5 px-4 py-3 w-full text-white font-medium rounded-xl hover:bg-blue-500/30 transition">
          <HelpCircle className="h-5 w-5 text-blue-100" />
          <span>Support</span>
        </button>
        
        <div className="h-px bg-blue-500/30 w-full my-2"></div>
        
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600/30">
          <div className="flex items-center gap-3">
            <div className="bg-blue-300 w-8 h-8 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-800" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Min Profil</span>
              <span className="text-xs text-blue-200">Kontoindstillinger</span>
            </div>
          </div>
          
          <button 
            className="text-blue-100 hover:text-white transition-colors" 
            onClick={() => {/* TODO: implementer logout */}}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
