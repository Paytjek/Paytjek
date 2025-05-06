import React from "react";
import { useNavigate } from "react-router-dom";
// Tilføj evt. logo import her, fx: import Logo from "@/assets/images/logo.svg";

interface UploadSidebarProps {
  steps: string[];
  activeStep: number;
  setActiveStep: (step: number) => void;
}

const UploadSidebar: React.FC<UploadSidebarProps> = ({ steps, activeStep, setActiveStep }) => {
  const navigate = useNavigate();
  return (
    <aside
      className="relative w-full max-w-xs min-h-screen flex flex-col items-stretch px-0 py-0 font-sans overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
        borderTopRightRadius: '32px',
        borderBottomRightRadius: '32px',
        boxShadow: '0 4px 32px rgba(37,99,235,0.15)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -left-10 -bottom-20 w-64 h-64 rounded-full bg-white blur-xl"></div>
        <div className="absolute -right-10 -top-20 w-48 h-48 rounded-full bg-white blur-xl"></div>
        <div className="absolute right-1/4 bottom-1/3 w-24 h-24 rounded-full bg-white blur-lg"></div>
      </div>
      
      {/* Logo and Company Name */}
      <div className="relative flex flex-col gap-4 px-8 pt-8 pb-10 z-10">
        <button
          className="flex items-center text-white font-semibold text-base hover:underline opacity-90"
          onClick={() => navigate("/dashboard")}
        >
          ← Tilbage til Dashboard
        </button>
        <div className="flex items-center gap-3">
          <img src="/paytjek-logo-white-blue-bg-72-512x512.png" alt="Paytjek Logo" className="h-12 w-auto rounded-lg shadow-md" />
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tight text-white">PayTjek</span>
            <span className="text-xs text-blue-100 font-medium">Lønseddel Analyse Platform</span>
          </div>
        </div>
      </div>
      
      {/* Steps Navigation */}
      <nav className="relative flex flex-col gap-2 px-6 pt-2 pb-8 flex-1 z-10">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          const isUpcoming = idx > activeStep;
          return (
            <button
              key={step}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition duration-200 text-left w-full ${
                isActive 
                  ? "bg-white shadow-lg text-blue-700 font-bold" 
                  : "bg-transparent text-white hover:bg-blue-500/30 font-medium"
              }`}
              disabled={isUpcoming}
              onClick={() => isCompleted && setActiveStep(idx)}
            >
              <div className={`flex items-center justify-center w-5 h-5 ${
                isActive ? 'text-blue-700' : 'text-blue-100'
              }`}>
                {idx + 1}
              </div>
              <span>{step}</span>
              
              {isActive && (
                <div className="ml-auto w-1.5 h-6 bg-blue-700 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Bottom Section */}
      <div className="relative px-6 pb-8 pt-4 z-10 mt-auto space-y-3">
        <button className="flex items-center gap-3.5 px-4 py-3 w-full text-white font-medium rounded-xl hover:bg-blue-500/30 transition"
          onClick={() => navigate("/dashboard")}>
          <span>Afbryd upload</span>
        </button>
        
        <div className="h-px bg-blue-500/30 w-full my-2"></div>
        
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600/30">
          <div className="flex items-center gap-3">
            <div className="bg-blue-300 w-8 h-8 rounded-full flex items-center justify-center">
              <span className="h-4 w-4 text-blue-800 font-bold">?</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Hjælp</span>
              <span className="text-xs text-blue-200">Kontakt support</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default UploadSidebar; 