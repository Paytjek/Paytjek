import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

  return (
    <div className="h-full flex flex-col bg-sidebar border-r">
      <div className="p-4 border-b">
        <Link to="/">
          <div className="flex items-center space-x-2">
            <img src="/assets/images/logo.svg" alt="PayTjek Logo" className="h-8 w-auto" />
            <span className="font-bold text-lg">PayTjek</span>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link to={item.path} key={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
