import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import TypingEffect from "@/components/TypingEffect";

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  // Words that will be cycled through with the typing effect
  const changingWords = [
    "Overenskomst?",
    "Arbejdstidsaftale?",
    "Arbejdskalender?",
    "Kontrakt?"
  ];
  
  return (
    <div className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Får du den korrekte løn ifølge din
            <br />
            <span className="text-blue-600">
              <TypingEffect 
                texts={changingWords}
                typingSpeed={80}
                deletingSpeed={40}
                delayAfterTyping={2000}
                delayAfterDeleting={500}
                showCursor={true}
                loop={true}
              />
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
            {t('landing.hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                {t('common.tryDemo')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/upload">
              <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                {t('common.uploadPayslip')}
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-12">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-full max-w-sm">
            <div className="text-sm text-gray-500 mb-2">lønseddel.pdf</div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-4 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
              </div>
              <div className="h-20 bg-gray-100 rounded"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-4 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="transform rotate-90 md:rotate-0 text-gray-400 my-2 md:my-0">
            <ArrowRight className="h-8 w-8" />
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-4 w-full max-w-sm font-mono text-sm text-blue-400">
            <pre className="overflow-auto max-h-44">
{`{
  "medarbejder": "Peter Jensen",
  "periode": "01-30 Apr 2023",
  "bruttoløn": 32500,
  "skat": 9750,
  "pension": {
    "egetBidrag": 1625,
    "arbejdsgiverBidrag": 3250
  },
  "feriepenge": {
    "optjent": 4062.5,
    "saldo": 24375
  },
  "overenskomst": {
    "status": "OK",
    "bemærkninger": []
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
