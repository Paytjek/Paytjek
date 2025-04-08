import React from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { day: "Mon", hours: 8.5 },
  { day: "Tue", hours: 9 },
  { day: "Wed", hours: 8 },
  { day: "Thu", hours: 8.75 },
  { day: "Fri", hours: 7.5 },
];

const WorkingHoursWidget: React.FC = () => {
  const { t } = useTranslation();
  
  // Calculate totals and averages
  const totalHours = data.reduce((sum, day) => sum + day.hours, 0);
  const avgHours = totalHours / data.length;

  return (
    <div className="h-64">
      <div className="flex justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500">{t('widgets.workingHours.totalHours')}</div>
          <div className="text-xl font-medium">{totalHours.toFixed(1)}{t('widgets.timeOff.hours')}</div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">{t('widgets.workingHours.dailyAverage')}</div>
          <div className="text-xl font-medium">{avgHours.toFixed(1)}{t('widgets.timeOff.hours')}</div>
        </div>
      </div>
      
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              domain={[6, 10]} 
              tick={{ fontSize: 10 }} 
              axisLine={false} 
              tickLine={false} 
              width={30}
            />
            <Tooltip 
              formatter={(value) => [`${value} ${t('widgets.timeOff.hours')}`, t('widgets.workingHours.workingTime')]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ stroke: '#3B82F6', strokeWidth: 2, fill: 'white', r: 4 }}
              activeDot={{ r: 6, fill: "#3B82F6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkingHoursWidget;
