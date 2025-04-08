import React from "react";
import { useTranslation } from "react-i18next";
import FileUploader from "@/components/upload/FileUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Upload: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('upload.title')}</h1>
        <p className="text-muted-foreground">
          {t('upload.description')}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('upload.card.title')}</CardTitle>
          <CardDescription>
            {t('upload.card.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-2">{t('upload.supportedFiles.title')}</h3>
          <p className="text-sm text-gray-600">{t('upload.supportedFiles.description')}</p>
        </div>
        
        <div className="p-6 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-2">{t('upload.maxSize.title')}</h3>
          <p className="text-sm text-gray-600">{t('upload.maxSize.description')}</p>
        </div>
        
        <div className="p-6 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-2">{t('upload.privacy.title')}</h3>
          <p className="text-sm text-gray-600">{t('upload.privacy.description')}</p>
        </div>
      </div>
    </div>
  );
};

export default Upload;
