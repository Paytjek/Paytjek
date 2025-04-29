import React from "react";

interface UploadBottomSheetProps {
  open: boolean;
  onClose: () => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
}

const UploadBottomSheet: React.FC<UploadBottomSheetProps> = ({ open, onClose, activeStep, setActiveStep }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center font-sans">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20" onClick={onClose} />
      {/* Sheet */}
      <div className="relative w-full max-w-xl bg-white rounded-t-3xl shadow-2xl p-12 animate-slide-up flex flex-col items-center">
        <button className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 text-3xl font-bold" onClick={onClose}>&times;</button>
        {/* Trin-indhold */}
        {activeStep === 0 && (
          <div className="flex flex-col items-center justify-center w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Upload din lønseddel</h2>
            <p className="text-lg text-gray-500 mb-8">Vælg din lønseddel som PDF eller billede</p>
            <button className="bg-[#2563eb] text-white font-bold text-lg px-8 py-4 rounded-xl shadow hover:bg-blue-700 transition w-full max-w-xs">
              Vælg fil
            </button>
          </div>
        )}
        {/* Flere trin kan tilføjes her */}
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
};

export default UploadBottomSheet; 