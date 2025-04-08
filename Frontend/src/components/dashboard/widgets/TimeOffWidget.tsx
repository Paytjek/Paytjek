import React from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { week: "W1", sick: 0, overtime: 2 },
  { week: "W2", sick: 1, overtime: 0 },
  { week: "W3", sick: 0, overtime: 1.5 },
  { week: "W4", sick: 0, overtime: 3 },
];

const TimeOffWidget: React.FC = () => {
  const { t } = useTranslation();
  
  // Simulated data
  const totalSickDays = data.reduce((sum, item) => sum + item.sick, 0);
  const totalOvertimeHours = data.reduce((sum, item) => sum + item.overtime, 0);

  return (
    <div className="h-56">
      <div className="flex justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500">{t('widgets.timeOff.sickDays')}</div>
          <div className="text-xl font-medium">{totalSickDays} {t('widgets.timeOff.days')}</div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">{t('widgets.timeOff.overtime')}</div>
          <div className="text-xl font-medium">{totalOvertimeHours} {t('widgets.timeOff.hours')}</div>
        </div>
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
          >
            <defs>
              <linearGradient id="colorSick" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFAB00" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FFAB00" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOvertime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3366FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3366FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide={true} />
            <Tooltip 
              formatter={(value, name) => [
                `${value} ${name === 'sick' ? t('widgets.timeOff.days') : t('widgets.timeOff.hours')}`, 
                name === 'sick' ? t('widgets.timeOff.sickDays') : t('widgets.timeOff.overtime')
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="sick" 
              stroke="#FFAB00" 
              fillOpacity={1} 
              fill="url(#colorSick)" 
            />
            <Area 
              type="monotone" 
              dataKey="overtime" 
              stroke="#3366FF" 
              fillOpacity={1} 
              fill="url(#colorOvertime)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-warning mr-2"></div>
          <span className="text-xs">{t('widgets.timeOff.sickDays')}</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
          <span className="text-xs">{t('widgets.timeOff.overtime')}</span>
        </div>
      </div>
    </div>
  );
};

export default TimeOffWidget;
