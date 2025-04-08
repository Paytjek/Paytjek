import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { month: "Jan", employee: 250, employer: 250 },
  { month: "Feb", employee: 250, employer: 250 },
  { month: "Mar", employee: 250, employer: 250 },
  { month: "Apr", employee: 250, employer: 250 },
  { month: "May", employee: 250, employer: 250 },
  { month: "Jun", employee: 250, employer: 250 }
];

const PensionWidget: React.FC = () => {
  const { t } = useTranslation();
  
  // Custom formatter for the legend
  const legendFormatter = (value: string) => {
    if (value === 'employee') return t('widgets.pension.yourContribution');
    if (value === 'employer') return t('widgets.pension.employerContribution');
    return value;
  };
  
  // Custom formatter for tooltip
  const tooltipFormatter = (value: number, name: string) => {
    let translatedName = name;
    if (name === 'employee') translatedName = t('widgets.pension.yourContribution');
    if (name === 'employer') translatedName = t('widgets.pension.employerContribution');
    return [`$${value}`, translatedName];
  };
  
  return (
    <div className="h-60">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">{t('widgets.pension.ytd')}</p>
            <p className="text-2xl font-semibold">$3,000</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{t('widgets.pension.employerMatch')}</p>
            <p className="text-lg font-medium text-secondary">100%</p>
          </div>
        </div>
        
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                formatter={tooltipFormatter}
                labelStyle={{ color: "#1F2937" }}
                contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              />
              <Legend 
                formatter={legendFormatter}
                iconSize={10}
                wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}
              />
              <Bar 
                dataKey="employee" 
                stackId="a" 
                fill="#3366FF" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="employer" 
                stackId="a" 
                fill="#00B8D9" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PensionWidget;
