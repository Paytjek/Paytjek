import React from "react";
import { useTranslation } from "react-i18next";
import { Calculator, PieChart, Calendar, Clock, BarChart } from "lucide-react";

const features = [
  {
    icon: Calculator,
    key: "tax",
  },
  {
    icon: PieChart,
    key: "pension",
  },
  {
    icon: Calendar,
    key: "vacation",
  },
  {
    icon: Clock,
    key: "timeOff",
  },
  {
    icon: BarChart,
    key: "hours",
  },
];

const Features: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">
            {t('landing.features.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('landing.features.description')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-100 card-shadow hover:shadow-xl transition-all"
            >
              <div className="feature-icon inline-block mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t(`landing.features.items.${feature.key}.title`)}
              </h3>
              <p className="text-gray-600">
                {t(`landing.features.items.${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
