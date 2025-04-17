import React from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ProfileSelector } from "@/components/ProfileSelector";
import { useProfile } from "@/contexts/ProfileContext";
import { useTranslation } from "react-i18next";

const UserProfile: React.FC = () => {
  const { toast } = useToast();
  const { selectedProfile } = useProfile();
  const { t } = useTranslation();
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("settings.profileUpdated.title"),
      description: t("settings.profileUpdated.description"),
    });
  };
  
  return (
    <form onSubmit={handleSave}>
      <CardContent>
        <div className="space-y-6 max-w-md">
          <ProfileSelector />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end border-t pt-6">
        <Button type="submit">
          {t("settings.saveChanges")}
        </Button>
      </CardFooter>
    </form>
  );
};

export default UserProfile;
