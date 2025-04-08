import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-heading">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
          {t('landing.hero.description')}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              {t('common.tryDemo')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/upload">
            <Button size="lg" variant="outline">
              {t('common.uploadPayslip')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
