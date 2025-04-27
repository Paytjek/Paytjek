import React from "react";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";

const Comparison: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Hvorfor vælge PayTjek?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Sammenlign PayTjek med manuelle metoder for at tjekke din lønseddel og overenskomst
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 border-b-2 border-gray-200"></th>
                  <th className="p-4 border-b-2 border-blue-500 bg-blue-50 text-blue-700 text-center">
                    PayTjek
                  </th>
                  <th className="p-4 border-b-2 border-gray-200 text-gray-700 text-center">
                    Manuel Verificering
                  </th>
                  <th className="p-4 border-b-2 border-gray-200 text-gray-700 text-center">
                    Fagforening
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 border-b border-gray-100 font-medium">Automatisk analyse</td>
                  <td className="p-4 border-b border-gray-100 text-center text-green-600">
                    <Check className="h-5 w-5 mx-auto" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-red-500">
                    <X className="h-5 w-5 mx-auto" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-gray-400 relative">
                    <div className="h-1 w-8 bg-gray-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 border-b border-gray-100 font-medium">Øjeblikkelig respons</td>
                  <td className="p-4 border-b border-gray-100 text-center text-green-600">
                    <Check className="h-5 w-5 mx-auto" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-gray-400 relative">
                    <div className="h-1 w-8 bg-gray-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-red-500">
                    <X className="h-5 w-5 mx-auto" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 border-b border-gray-100 font-medium">Overholder overenskomst</td>
                  <td className="p-4 border-b border-gray-100 text-center text-green-600">
                    <Check className="h-5 w-5 mx-auto" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-gray-400 relative">
                    <div className="h-1 w-8 bg-gray-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-green-600">
                    <Check className="h-5 w-5 mx-auto" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 border-b border-gray-100 font-medium">Gratis at bruge</td>
                  <td className="p-4 border-b border-gray-100 text-center text-green-600">
                    <Check className="h-5 w-5 mx-auto" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-green-600">
                    <Check className="h-5 w-5 mx-auto" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-red-500">
                    <X className="h-5 w-5 mx-auto" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 border-b border-gray-100 font-medium">Historisk overblik</td>
                  <td className="p-4 border-b border-gray-100 text-center text-green-600">
                    <Check className="h-5 w-5 mx-auto" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-red-500">
                    <X className="h-5 w-5 mx-auto" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center text-gray-400 relative">
                    <div className="h-1 w-8 bg-gray-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparison; 