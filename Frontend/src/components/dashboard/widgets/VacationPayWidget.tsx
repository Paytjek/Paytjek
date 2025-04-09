import React from "react";
import { useTranslation } from "react-i18next";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Calendar } from "lucide-react";

const VacationPayWidget: React.FC = () => {
  const { t } = useTranslation();
  
  // Simulated data - vacation days
  const totalDays = 25;
  const usedDays = 10;
  const remainingDays = totalDays - usedDays;
  const percentage = (remainingDays / totalDays) * 100;

  return (
    <div className="h-56 flex flex-col items-center justify-center">
      <div className="w-32 h-32 mb-4">
        <CircularProgressbarWithChildren
          value={percentage}
          styles={buildStyles({
            pathColor: "#10B981",
            trailColor: "#E5E7EB",
            strokeLinecap: "round"
          })}
        >
          <div className="flex flex-col items-center">
            <Calendar className="h-5 w-5 text-gray-400 mb-1" />
            <div className="text-2xl font-bold">{remainingDays}</div>
            <div className="text-xs text-gray-500">{t('widgets.vacation.daysLeft')}</div>
          </div>
        </CircularProgressbarWithChildren>
      </div>
      
      <div className="flex w-full justify-between text-sm">
        <div className="text-center">
          <div className="text-gray-500">{t('widgets.vacation.total')}</div>
          <div className="font-medium">{totalDays} {t('widgets.timeOff.days')}</div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-500">{t('widgets.vacation.used')}</div>
          <div className="font-medium">{usedDays} {t('widgets.timeOff.days')}</div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-500">{t('widgets.vacation.accruedValue')}</div>
          <div className="font-medium">Kr. 2.160</div>
        </div>
      </div>
    </div>
  );
};

export default VacationPayWidget;
