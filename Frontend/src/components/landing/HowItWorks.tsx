import React from "react";
import { useTranslation } from "react-i18next";
import { Upload, TrendingUp, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    key: "upload",
  },
  {
    icon: TrendingUp,
    key: "analysis",
  },
  {
    icon: BarChart3,
    key: "insights",
  },
];

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('landing.howItWorks.description')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative bg-white rounded-xl p-8 border border-gray-100 card-shadow text-center"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 w-8 h-1 bg-gray-200 z-10"></div>
              )}
              
              <div className="feature-icon mx-auto mb-6 h-12 w-12 flex items-center justify-center">
                <step.icon className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">
                {t(`landing.howItWorks.steps.${step.key}.title`)}
              </h3>
              <p className="text-gray-600">
                {t(`landing.howItWorks.steps.${step.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
