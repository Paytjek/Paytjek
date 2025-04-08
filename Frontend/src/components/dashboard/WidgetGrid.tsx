import React from "react";
import { useTranslation } from "react-i18next";
import TaxWidget from "./widgets/TaxWidget";
import PensionWidget from "./widgets/PensionWidget";
import VacationPayWidget from "./widgets/VacationPayWidget";
import TimeOffWidget from "./widgets/TimeOffWidget";
import WorkingHoursWidget from "./widgets/WorkingHoursWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const WidgetGrid: React.FC = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"} gap-6`}>
      <Card className="lg:col-span-2 dashboard-card">
        <CardHeader>
          <CardTitle>{t('widgets.tax.title')}</CardTitle>
          <CardDescription>{t('widgets.tax.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <TaxWidget />
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>{t('widgets.pension.title')}</CardTitle>
          <CardDescription>{t('widgets.pension.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <PensionWidget />
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>{t('widgets.vacation.title')}</CardTitle>
          <CardDescription>{t('widgets.vacation.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <VacationPayWidget />
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>{t('widgets.timeOff.title')}</CardTitle>
          <CardDescription>{t('widgets.timeOff.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeOffWidget />
        </CardContent>
      </Card>

      <Card className="lg:col-span-1 dashboard-card">
        <CardHeader>
          <CardTitle>{t('widgets.workingHours.title')}</CardTitle>
          <CardDescription>{t('widgets.workingHours.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkingHoursWidget />
        </CardContent>
      </Card>
    </div>
  );
};

export default WidgetGrid;
