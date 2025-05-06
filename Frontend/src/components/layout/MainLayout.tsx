import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const MainLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { t } = useTranslation();

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/dashboard")) return t("common.dashboard");
    if (path.includes("/upload")) return t("common.upload");
    if (path.includes("/schedule")) return t("schedule.title");
    if (path.includes("/analysis")) return t("common.analysis");
    if (path.includes("/settings")) return t("common.settings");
    return "PayTjek";
  };
  
  return (
    <div className="flex h-screen bg-background">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-64 h-full">
          <Sidebar />
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {isMobile && <div className="w-8"></div>} {/* Spacer when mobile */}
            <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-2 max-w-md w-full relative">
            <Search className="absolute left-3 h-4 w-4 text-gray-400"/>
            <Input 
              placeholder="Søg..." 
              className="pl-10 bg-gray-50 border-gray-200 focus-visible:bg-white"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-gray-200">
                  <Bell className="h-4 w-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-4 py-3 border-b">
                  <h3 className="font-medium">Notifikationer</h3>
                </div>
                <div className="py-2 px-4 text-sm text-gray-500">
                  Ingen nye notifikationer
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <LanguageSwitcher />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-gray-200">
                  <User className="h-4 w-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-4 py-2 border-b">
                  <p className="font-medium">Min Profil</p>
                  <p className="text-xs text-gray-500">admin@paytjek.dk</p>
                </div>
                <DropdownMenuItem>Profil Indstillinger</DropdownMenuItem>
                <DropdownMenuItem>Sikkerhed</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log ud</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
