
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Calculator, PieChart, Calendar, Clock, BarChart, Gauge } from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
}

const PluginSettings: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: "tax-analysis",
      name: "Tax Analysis",
      description: "Analyze and visualize your tax deductions",
      enabled: true,
      icon: Calculator
    },
    {
      id: "pension-overview",
      name: "Pension Overview",
      description: "Track pension contributions and projections",
      enabled: true,
      icon: PieChart
    },
    {
      id: "vacation-pay",
      name: "Vacation Pay",
      description: "Monitor vacation pay accrual and usage",
      enabled: true,
      icon: Calendar
    },
    {
      id: "time-off",
      name: "Time Off Monitor",
      description: "Track sick days, overtime, and time off balance",
      enabled: true,
      icon: Clock
    },
    {
      id: "working-hours",
      name: "Working Hours",
      description: "Analyze working hours patterns and productivity",
      enabled: true,
      icon: BarChart
    },
    {
      id: "performance-metrics",
      name: "Performance Metrics",
      description: "Track performance bonuses and metrics",
      enabled: false,
      icon: Gauge
    }
  ]);

  const togglePlugin = (id: string) => {
    setPlugins(plugins.map(plugin => 
      plugin.id === id ? { ...plugin, enabled: !plugin.enabled } : plugin
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Active Plugins</h3>
        <p className="text-sm text-gray-500">
          Enable or disable analysis plugins to customize your dashboard
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {plugins.map(plugin => (
          <div 
            key={plugin.id} 
            className={`p-4 rounded-lg border flex items-center gap-4 ${
              plugin.enabled ? "bg-white" : "bg-gray-50 opacity-70"
            }`}
          >
            <div className={`p-2 rounded-lg ${plugin.enabled ? "feature-icon" : "bg-gray-200"}`}>
              <plugin.icon className="h-5 w-5" color={plugin.enabled ? "white" : "#9CA3AF"} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium">{plugin.name}</h4>
              <p className="text-sm text-gray-500 truncate">{plugin.description}</p>
            </div>
            
            <Switch
              checked={plugin.enabled}
              onCheckedChange={() => togglePlugin(plugin.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PluginSettings;
