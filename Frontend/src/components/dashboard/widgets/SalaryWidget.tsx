import React from "react";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", salary: 5000 },
  { month: "Feb", salary: 5000 },
  { month: "Mar", salary: 5000 },
  { month: "Apr", salary: 5000 },
  { month: "May", salary: 5000 },
  { month: "Jun", salary: 5000 }
];

const SalaryWidget: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="h-60">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{t('widgets.salary.title')}</h3>
        <p className="text-sm text-gray-500">{t('widgets.salary.description')}</p>
      </div>
      
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">{t('widgets.salary.current')}</p>
            <p className="text-2xl font-semibold">Kr. 5.000</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{t('widgets.salary.change')}</p>
            <p className="text-lg font-medium text-finance-green">+0%</p>
          </div>
        </div>
        
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                formatter={(value) => [`Kr. ${value}`, '']}
                labelStyle={{ color: "#1F2937" }}
                contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              />
              <Line type="monotone" dataKey="salary" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalaryWidget; 