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
        background: "#3063A8",
        borderTopRightRadius: '64px',
        borderBottomRightRadius: '48px',
        boxShadow: '0 4px 32px rgba(37,99,235,0.10)'
      }}
    >
      {/* Dekorativ grafik baggrund */}
      <svg className="absolute left-[-60px] bottom-[-80px] w-[300px] h-[300px] opacity-10 pointer-events-none select-none" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="150" cy="150" r="150" fill="#fff" />
      </svg>
      <svg className="absolute right-[-80px] top-[-60px] w-[220px] h-[220px] opacity-10 pointer-events-none select-none" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="110" cy="110" r="110" fill="#fff" />
      </svg>
      {/* Top: Tilbage-knap og logo */}
      <div className="flex flex-col gap-4 px-8 pt-8 pb-4 z-10">
        <button
          className="flex items-center text-white font-semibold text-lg mb-2 hover:underline opacity-90"
          onClick={() => navigate("/dashboard")}
        >
          ←Tilbage til Dashboard
        </button>
        <div className="flex items-center gap-2 mb-2">
          <img src="/paytjek-logo-white-blue-bg-72-512x512.png" alt="Paytjek Logo" className="h-10 w-auto rounded" />
          <span className="text-3xl font-extrabold tracking-tight text-white">PayTjek</span>
        </div>
      </div>
      {/* Steps */}
      <nav className="flex flex-col gap-6 px-6 pt-2 pb-8 flex-1 z-10">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          const isUpcoming = idx > activeStep;
          return (
            <button
              key={step}
              className={`flex items-center gap-4 px-2 py-2 rounded-2xl transition text-left w-full text-xl
                ${isActive ? "bg-white shadow-lg" : "bg-transparent"}
              `}
              disabled={isUpcoming}
              onClick={() => isCompleted && setActiveStep(idx)}
              style={{fontSize: '1.25rem'}}
            >
              <span className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl font-bold border-2
                ${isActive ? "bg-blue-100 text-[#2563eb] border-[#2563eb]" :
                  isCompleted ? "bg-blue-400 text-white border-blue-400" :
                  "bg-blue-200 text-white border-blue-200"}
              `}>
                {idx + 1}
              </span>
              <span className={`font-bold ${isActive ? "text-[#2563eb]" : "text-white"} ${isActive ? "" : "opacity-90"}`}>{step}</span>
            </button>
          );
        })}
      </nav>
      {/* Mobil: evt. sticky bund eller ekstra spacing */}
      <div className="flex-1" />
    </aside>
  );
};

export default UploadSidebar; 