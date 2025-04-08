import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaxWidget from "@/components/dashboard/widgets/TaxWidget";
import PensionWidget from "@/components/dashboard/widgets/PensionWidget";
import VacationPayWidget from "@/components/dashboard/widgets/VacationPayWidget";
import TimeOffWidget from "@/components/dashboard/widgets/TimeOffWidget";
import WorkingHoursWidget from "@/components/dashboard/widgets/WorkingHoursWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Analysis: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('analysis.title')}</h1>
        <p className="text-muted-foreground">
          {t('analysis.description')}
        </p>
      </div>
      
      <Tabs defaultValue="tax">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="tax">{t('landing.features.items.tax.title')}</TabsTrigger>
          <TabsTrigger value="pension">{t('landing.features.items.pension.title')}</TabsTrigger>
          <TabsTrigger value="vacation">{t('landing.features.items.vacation.title')}</TabsTrigger>
          <TabsTrigger value="timeoff">{t('landing.features.items.timeOff.title')}</TabsTrigger>
          <TabsTrigger value="hours">{t('landing.features.items.hours.title')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tax" className="mt-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t('landing.features.items.tax.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <TaxWidget />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pension" className="mt-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t('landing.features.items.pension.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <PensionWidget />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vacation" className="mt-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t('landing.features.items.vacation.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <VacationPayWidget />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeoff" className="mt-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t('landing.features.items.timeOff.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <TimeOffWidget />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours" className="mt-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t('landing.features.items.hours.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <WorkingHoursWidget />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
