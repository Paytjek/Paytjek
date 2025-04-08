import React from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "incomeTax", value: 650 },
  { name: "socialSecurity", value: 320 },
  { name: "medicare", value: 180 },
  { name: "otherTaxes", value: 120 }
];

const COLORS = ["#3B82F6", "#0EA5E9", "#8B5CF6", "#10B981"];

const TaxWidget: React.FC = () => {
  const { t } = useTranslation();
  const totalTax = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="h-64">
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, t('widgets.tax.amount')]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-full md:w-1/2">
          <div className="space-y-2">
            {data.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-sm">{t(`widgets.tax.types.${item.name}`)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-sm font-medium">${item.value}</span>
                  <span className="text-xs text-gray-500">({((item.value / totalTax) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-medium">{t('widgets.tax.total')}</span>
              <span className="font-medium">${totalTax}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxWidget;
