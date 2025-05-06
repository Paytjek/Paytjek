import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Comparison from "@/components/landing/Comparison";
import Security from "@/components/landing/Security";
import Footer from "@/components/landing/Footer";
import PayslipAnimation from "@/components/landing/PayslipAnimation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Landing: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/paytjek-logo-white-blue-bg-72-512x512.png" alt="PayTjek Logo" className="h-10 w-auto rounded-lg" />
            <div className="flex flex-col">
              <span className="font-bold text-xl text-blue-700">PayTjek</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:block">Lønseddel Analyse Platform</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <div className="group relative">
              <button className="flex items-center text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors">
                Produkt <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 top-full mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-1">
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    {t('common.dashboard')}
                  </Link>
                  <Link to="/upload" className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    {t('common.upload')}
                  </Link>
                  <Link to="/analysis" className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    {t('common.analysis')}
                  </Link>
                </div>
              </div>
            </div>
            
            <Link to="/schedule" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors">
              {t('schedule.title')}
            </Link>
            
            <Link to="#" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors">
              Om os
            </Link>
            
            <Link to="#" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors">
              Kontakt
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className="text-sm font-medium text-blue-700 hover:text-blue-800 px-4 py-2 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors">
                Log ind
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md flex items-center transition-colors">
                {t('common.getStarted')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="flex md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">{t('common.dashboard')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/upload">{t('common.upload')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/schedule">{t('schedule.title')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/analysis">{t('common.analysis')}</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="border-l pl-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Hero />
        <Features />
        <PayslipAnimation />
        <HowItWorks />
        <Security />
        <Comparison />
      </main>
      
      <Footer />
    </div>
  );
};

export default Landing;
