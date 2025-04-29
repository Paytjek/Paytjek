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

const Landing: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/assets/images/logo.svg" alt="PayTjek Logo" className="h-8 w-auto" />
            <span className="font-bold text-lg">PayTjek</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t('common.dashboard')}
            </Link>
            <Link 
              to="/upload" 
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t('common.upload')}
            </Link>
            <div className="pl-3 border-l">
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
