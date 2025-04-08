import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LanguageSwitcher from "../LanguageSwitcher";

const MainLayout: React.FC = () => {
  const isMobile = useIsMobile();
  
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
      
      <main className={`flex-1 overflow-auto p-4 md:p-8 ${isMobile ? 'pt-16' : ''}`}>
        <div className="fixed top-4 right-4 z-40">
          <LanguageSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
