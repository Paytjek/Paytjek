import React from "react";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Eye } from "lucide-react";

const Security: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="py-16 md:py-20 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-900 text-blue-300 font-medium text-sm">
            SIKKERHED OG PRIVATLIV
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Dine lønsedler er sikre hos os
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Vi tager beskyttelsen af dine personlige data alvorligt. Alle lønsedler behandles fortroligt og med den højeste grad af sikkerhed.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-blue-300 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Krypteret data</h3>
            <p className="text-gray-300">
              Alle dine lønsedler og personlige oplysninger er krypteret både under overførsel og opbevaring.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-blue-300 mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Dataopbevaring</h3>
            <p className="text-gray-300">
              Du har fuld kontrol over dine data. Du kan til enhver tid slette eller eksportere dine lønsedler fra systemet.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-blue-300 mb-4">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Begrænset adgang</h3>
            <p className="text-gray-300">
              Kun du har adgang til dine lønsedler og analyser. Vi videregiver aldrig dine data til tredjeparter uden dit samtykke.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security; 