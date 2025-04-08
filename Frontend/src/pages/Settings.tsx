import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfile from "@/components/settings/UserProfile";
import PluginSettings from "@/components/settings/PluginSettings";

const Settings: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.description')}
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="plugins">{t('settings.plugins')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.profileInfo')}</CardTitle>
            </CardHeader>
            <UserProfile />
          </Card>
        </TabsContent>
        
        <TabsContent value="plugins" className="mt-6">
          <Card className="p-6">
            <PluginSettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
