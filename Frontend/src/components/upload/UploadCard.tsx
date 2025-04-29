import React from "react";
import FileUploader from "@/components/upload/FileUploader";

interface UploadCardProps {
  onUploadSuccess?: () => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ onUploadSuccess }) => {
  return (
    <div className="w-full h-screen flex items-start justify-center bg-white">
      <div className="flex flex-col items-center justify-center mt-24 w-full max-w-2xl">
        <img src="/paytjek-logo-white-blue-bg-72-512x512.png" alt="PayTjek Logo" className="w-28 h-28 mb-8" />
        <h1 className="text-4xl font-light text-center mb-4">
          Upload din <span className="font-bold">Lønseddel</span> til PayTjek
        </h1>
        <p className="text-lg text-gray-500 text-center mb-8 max-w-xl">
          Så tjekker vi den hurtigt igennem og sikrer dig, at du får hver en krone du har krav på.
        </p>
        <FileUploader onUploadSuccess={onUploadSuccess} />
      </div>
    </div>
  );
};

export default UploadCard; 