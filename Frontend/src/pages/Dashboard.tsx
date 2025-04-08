import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import WidgetGrid from "@/components/dashboard/WidgetGrid";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.viewData')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            March 2025
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('common.export')}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>{t('dashboard.grossSalary.title')}</CardDescription>
            <CardTitle className="text-2xl">$5,000.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600 flex items-center">
              {t('dashboard.grossSalary.increase', { percent: 2.5 })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>{t('dashboard.netSalary.title')}</CardDescription>
            <CardTitle className="text-2xl">$3,730.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.netSalary.description')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>{t('dashboard.deductions.title')}</CardDescription>
            <CardTitle className="text-2xl">$1,270.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.deductions.description', { percent: 25.4 })}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="payslip">
        <TabsList>
          <TabsTrigger value="payslip">{t('common.currentPayslip')}</TabsTrigger>
          <TabsTrigger value="history">{t('common.history')}</TabsTrigger>
        </TabsList>
        <TabsContent value="payslip" className="mt-6">
          <WidgetGrid />
        </TabsContent>
        <TabsContent value="history">
          <div className="h-72 flex items-center justify-center border rounded-lg bg-gray-50">
            <p className="text-muted-foreground">{t('common.historicalData')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
