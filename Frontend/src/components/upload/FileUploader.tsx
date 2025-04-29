import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useProfile } from "@/contexts/ProfileContext";

const API_URL = "http://localhost:8000"; // Ændr til den faktiske backend-URL

interface FileUploaderProps {
  onUploadStart: () => void;
  onUploadSuccess: (uploadId: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess, onUploadStart }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedProfile } = useProfile();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      return validTypes.includes(file.type);
    });
    
    if (newFiles.length < fileList.length) {
      toast({
        title: t('upload.fileUploader.invalidType.title'),
        description: t('upload.fileUploader.invalidType.description'),
        variant: "destructive",
      });
    }
    
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    if (onUploadStart) onUploadStart();
    
    // Kontroller om der er valgt en brugerprofil
    if (!selectedProfile?.user_id) {
      toast({
        title: "Ingen bruger valgt",
        description: "Vælg venligst en bruger før du uploader en lønseddel",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    setProgress(10);
    
    try {
      // Upload filen til vores backend-API
      const formData = new FormData();
      formData.append("file", files[0]);
      
      // Tilføj bruger-ID til formsdata
      formData.append("user_id", selectedProfile.user_id);
      
      setProgress(30);
      
      const response = await fetch(`${API_URL}/api/v1/upload`, {
        method: "POST",
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      setProgress(70);
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const validationResult = await response.json();
      
      // Gem resultatet i localstorage med bruger-specifik nøgle
      const storageKey = `validationResult_${selectedProfile.user_id}`;
      localStorage.setItem(storageKey, JSON.stringify(validationResult));
      
      setProgress(100);
      
      toast({
        title: t('upload.fileUploader.success.title'),
        description: t('upload.fileUploader.success.description'),
        variant: "default",
      });
      
      if (onUploadSuccess) onUploadSuccess(validationResult.uploadId);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload fejlede",
        description: String(error),
        variant: "destructive",
      });
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-20 min-h-[220px] w-full transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 flex flex-col items-center">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80 px-6 py-3 text-lg"
            >
              <span>{t('upload.fileUploader.browse')}</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                multiple
              />
            </label>
            <span className="mt-2 text-base text-gray-600">{t('upload.fileUploader.or')}</span>
          </div>
          <p className="text-base leading-5 text-gray-600 mt-2">
            {t('upload.fileUploader.dragDrop')}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <div className="space-y-4">
            {files.map((file, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            {uploading ? (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-gray-500 text-center">
                  {progress}%
                </p>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={uploadFiles}
                disabled={files.length === 0 || !selectedProfile}
              >
                {t('common.upload')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
