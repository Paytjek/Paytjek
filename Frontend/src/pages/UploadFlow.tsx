import React, { useState, useEffect } from "react";
import UploadSidebar from "@/components/upload/UploadSidebar";
import UploadBottomSheet from "@/components/upload/UploadBottomSheet";
import FileUploader from "@/components/upload/FileUploader";
import { Check, XCircle, ChevronDown } from "lucide-react";

const steps = [
  "Upload lønseddel",
  "Behandling",
  "Status",
  "Vis lønrapport",
  "Næste skridt"
];

const Behandling: React.FC<{ progress: number; analyzing: boolean }> = ({ progress, analyzing }) => {
  const [spin, setSpin] = React.useState(false);

  React.useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      setSpin(true);
      setTimeout(() => setSpin(false), 2500); // spin varer 2.5 sek
    }, 5000); // spin hvert 5. sekund
    // Start med at spinne én gang straks
    setSpin(true);
    const firstTimeout = setTimeout(() => setSpin(false), 2500);
    return () => {
      clearInterval(interval);
      clearTimeout(firstTimeout);
    };
  }, [analyzing]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center mb-8">
        <img
          src="/paytjek-logo-white-blue-bg-72-512x512.png"
          alt="PayTjek Logo"
          className={`w-28 h-28 mb-4 ${spin ? 'animate-spin-slow' : ''}`}
          style={{ animationDuration: '2.5s' }}
        />
        <h2 className="text-2xl font-bold text-center mb-2">Din lønseddel analyseres</h2>
        <p className="text-lg text-gray-500 text-center max-w-xl">
          Systemet er i gang med at scanne og analysere din lønseddel for fejl og mangler. Dette tager typisk op til 90 sekunder. 
        </p>
      </div>
      <div className="w-full max-w-lg">
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden relative">
          {/* Indeterminate overlay */}
          <div
            className="absolute left-0 top-0 h-6 w-full pointer-events-none animate-progress-indeterminate"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #2563eb55 50%, transparent 100%)',
              opacity: 0.5,
            }}
          />
          {/* Tid-baseret progress */}
          <div
            className="bg-[#2563eb] h-6 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const AnimatedCheckmark: React.FC = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-6 flex-shrink-0">
    <circle cx="28" cy="28" r="26" stroke="#22c55e" strokeWidth="4" fill="#e6faed" />
    <path
      d="M18 29L26 37L39 21"
      stroke="#22c55e"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: 40,
        strokeDashoffset: 0,
        animation: 'draw-check 0.7s cubic-bezier(.4,2,.6,1) forwards',
      }}
    />
    <style>{`
      @keyframes draw-check {
        from { stroke-dashoffset: 40; }
        to { stroke-dashoffset: 0; }
      }
    `}</style>
  </svg>
);

const StatusChecklist: React.FC = () => (
  <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-8 flex flex-col gap-4 mb-8">
    <div className="font-bold text-xl mb-2 text-gray-800">Vi har tjekket følgende for dig:</div>
    <ul className="space-y-3">
      <li className="flex items-start gap-3"><Check className="text-green-500 w-6 h-6 mt-1" />Lønseddel stemmer overens med arbejdstider og betalte timer</li>
      <li className="flex items-start gap-3"><Check className="text-green-500 w-6 h-6 mt-1" />Alle tillæg og overarbejde er korrekt medregnet</li>
      <li className="flex items-start gap-3"><Check className="text-green-500 w-6 h-6 mt-1" />Feriepenge er korrekt beregnet</li>
      <li className="flex items-start gap-3"><Check className="text-green-500 w-6 h-6 mt-1" />Skatteprocent og fradrag er korrekte</li>
      <li className="flex items-start gap-3"><Check className="text-green-500 w-6 h-6 mt-1" />Udbetalt løn svarer til det aftalte i kontrakten</li>
      <li className="flex items-start gap-3"><Check className="text-green-500 w-6 h-6 mt-1" />Ingen uregelmæssigheder fundet i lønperioden</li>
      <li className="flex items-start gap-3"><Check className="text-green-500 w-6 h-6 mt-1" />Lønseddel indeholder alle lovpligtige oplysninger</li>
    </ul>
  </div>
);

const Status: React.FC<{ success: boolean; onShowReport: () => void }> = ({ success, onShowReport }) => (
  <div className="w-full">
    <div
      className={`relative p-10 w-full max-w-7xl mx-auto flex items-start mt-0 mb-8 bg-green-50 shadow-xl rounded-2xl border-0`}
      style={{
        border: '4px solid #22c55e',
        background: '#e6faed',
        boxShadow: '0 4px 32px rgba(34,197,94,0.10)',
      }}
    >
      {success ? (
        <>
          <AnimatedCheckmark />
          <div>
            <div className="font-extrabold text-3xl mb-2 text-green-700 tracking-tight">Din lønseddel er korrekt</div>
            <div className="text-lg text-green-700 font-medium">Vi har valideret din lønseddel og fundet ingen problemer</div>
          </div>
        </>
      ) : (
        <>
          <XCircle className="text-red-500 w-12 h-12 mt-1 mr-6 flex-shrink-0" />
          <div>
            <div className="font-extrabold text-3xl mb-2 text-gray-900 tracking-tight">Der er fejl i din lønseddel</div>
            <div className="text-lg text-gray-600 font-medium">Vi har fundet problemer i din lønseddel. Se detaljer nedenfor.</div>
          </div>
        </>
      )}
    </div>
    {success && <StatusChecklist />}
    {success && (
      <div className="flex flex-col items-center mb-6 cursor-pointer" onClick={onShowReport}>
        <ChevronDown className="w-8 h-8 text-green-600 animate-bounce mb-1" />
        <span className="text-green-700 font-semibold text-lg">Se den fulde rapport</span>
      </div>
    )}
  </div>
);

const Report: React.FC = () => (
  <div className="w-full max-w-7xl mx-auto">
    <div className="bg-white rounded-2xl shadow p-10 text-gray-900 text-xl font-semibold text-center w-full">
      Her kommer den fulde lønrapport (indsæt rapport-komponent her)
    </div>
  </div>
);

const UploadFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(true);
  const [progress, setProgress] = useState(0);
  const [behandlingActive, setBehandlingActive] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);

  // Når upload starter
  const handleUploadStart = () => {
    setActiveStep(1);
    setBehandlingActive(true);
    setProgress(0);
    setAnalysisDone(false);
    let elapsed = 0;
    const total = 90; // sekunder (sat til 1,5 minut)
    const interval = setInterval(() => {
      elapsed += 0.5;
      setProgress((prev) => Math.min((elapsed / total) * 100, 100));
      if (elapsed >= total) {
        clearInterval(interval);
      }
    }, 500);
  };

  // Når upload er færdig, marker analysen som færdig
  const handleUploadSuccess = () => {
    setAnalysisDone(true);
  };

  // Poll analyse status
  useEffect(() => {
    if (!uploadId || analysisDone) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/analysis/status/${uploadId}`);
        const data = await response.json();
        
        if (data.status === 'processing') {
          // Opdater progress baseret på analyse status
          setProgress(30 + (data.progress || 0) * 0.7); // 30-100% er analyse
        } else if (data.status === 'completed') {
          setProgress(100);
          setAnalysisDone(true);
          setUploadId(null);
        }
      } catch (error) {
        console.error('Error polling analysis status:', error);
      }
    };

    const interval = setInterval(pollStatus, 1000); // Poll hvert sekund
    return () => clearInterval(interval);
  }, [uploadId, analysisDone]);

  // Gå videre til status når analyse er færdig
  useEffect(() => {
    if (progress >= 100 && analysisDone) {
      const timeout = setTimeout(() => setActiveStep(2), 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, analysisDone]);

  // Håndter visning af rapport
  const handleShowReport = () => {
    setActiveStep(3);
    setShowReport(true);
  };

  // Håndter sidebar navigation
  const handleStepChange = (step: number) => {
    setActiveStep(step);
    if (step === 2) {
      setShowReport(false);
    } else if (step === 3) {
      setShowReport(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-[420px] max-w-md">
        <UploadSidebar steps={steps} activeStep={activeStep} setActiveStep={handleStepChange} />
      </div>
      <main
        className="flex-1 flex flex-col items-center justify-center p-0 md:p-20 bg-white shadow-xl rounded-l-none md:rounded-l-[180px] min-h-screen transition-all duration-300"
        style={{marginLeft: '-140px', zIndex: 20}}
      >
        <div className="flex flex-col items-center justify-center w-full">
          {activeStep === 0 && (
            <div className="w-full max-w-2xl">
              <img src="/paytjek-logo-white-blue-bg-72-512x512.png" alt="PayTjek Logo" className="w-28 h-28 mb-8 mx-auto" />
              <h1 className="text-4xl font-light text-center mb-4">
                Upload din <span className="font-bold">Lønseddel</span> til PayTjek
              </h1>
              <p className="text-lg text-gray-500 text-center mb-8 max-w-xl mx-auto">
                Så tjekker vi den hurtigt igennem og sikrer dig, at du får hver en krone du har krav på.
              </p>
              <FileUploader onUploadStart={handleUploadStart} onUploadSuccess={handleUploadSuccess} />
            </div>
          )}
          {activeStep === 1 && (
            <div className="w-full max-w-2xl">
              <Behandling progress={progress} analyzing={!analysisDone} />
            </div>
          )}
          {activeStep === 2 && !showReport && (
            <Status success={statusSuccess} onShowReport={handleShowReport} />
          )}
          {activeStep === 3 && showReport && <Report />}
        </div>
      </main>
      <UploadBottomSheet
        open={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        activeStep={activeStep}
        setActiveStep={handleStepChange}
      />
    </div>
  );
};

// Tilføj animation til tailwind config
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin-slow { 100% { transform: rotate(360deg); } }
  .animate-spin-slow { animation: spin-slow 2.5s linear infinite; }
  @keyframes progress-indeterminate {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-progress-indeterminate {
    animation: progress-indeterminate 1.5s infinite linear;
  }
`;
document.head.appendChild(style);

export default UploadFlow; 