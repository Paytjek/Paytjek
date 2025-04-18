import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CalendarWidget from "@/components/dashboard/widgets/CalendarWidget";

const Schedule: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("schedule.title")}</CardTitle>
          <CardDescription>
            {t("schedule.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <CalendarWidget isFullPage={true} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule; 