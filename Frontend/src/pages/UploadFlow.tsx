import React, { useState, useEffect } from "react";
import UploadSidebar from "@/components/upload/UploadSidebar";
import UploadBottomSheet from "@/components/upload/UploadBottomSheet";
import FileUploader from "@/components/upload/FileUploader";
import { Check, XCircle, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProfile } from '@/contexts/ProfileContext';

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

const COLORS = ['#22c55e', '#ef4444', '#f59e42', '#2563eb'];
const LABELS = ['Udbetalt løn', 'Skat', 'AM-bidrag', 'Pension'];

const Report: React.FC = () => {
  const { selectedProfile } = useProfile();
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    if (selectedProfile?.user_id) {
      const storageKey = `validationResult_${selectedProfile.user_id}`;
      const storedResult = localStorage.getItem(storageKey);
      if (storedResult) {
        try {
          const parsed = JSON.parse(storedResult);
          setData(parsed);
        } catch (e) {
          setData(null);
        }
      }
    }
  }, [selectedProfile]);

  if (!data || !data.payslip_data) {
    return <div className="text-center text-gray-500">Ingen lønseddel fundet.</div>;
  }

  // Ekstraher værdier
  const brutto = data.payslip_data.bruttoløn || 0;
  const udbetalt = data.payslip_data.nettoløn || 0;
  const skat = data.payslip_data.skat || 0;
  const am = data.payslip_data.am_bidrag || 0;
  const pension = data.payslip_data.pension || 0;

  // Doughnut data
  const chartData = [
    { name: 'Udbetalt løn', value: udbetalt, color: COLORS[0] },
    { name: 'Skat', value: skat, color: COLORS[1] },
    { name: 'AM-bidrag', value: am, color: COLORS[2] },
    { name: 'Pension', value: pension, color: COLORS[3] },
  ];
  const total = chartData.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <div className="text-3xl md:text-4xl font-bold text-center mb-2">
        Udbetalt til din konto: <span className="text-green-600">{udbetalt.toLocaleString()} kr.</span>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-6">
        <ResponsiveContainer width={260} height={260}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              label={false}
              isAnimationActive={true}
            >
              {chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${value.toLocaleString()} kr. (${((value/total)*100).toFixed(1)}%)`,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1">
          <ul className="space-y-3 mb-4">
            {chartData.map((item, idx) => (
              <li key={item.name} className="flex items-center gap-3">
                <span className="inline-block w-4 h-4 rounded-full" style={{background: item.color}}></span>
                <span className="font-medium w-32 inline-block">{item.name}</span>
                <span className="w-24 inline-block">{item.value.toLocaleString()} kr.</span>
                <span className="text-gray-500">{((item.value/total)*100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
          <div className="text-gray-600 text-sm mt-2">
            Skat og AM-bidrag trækkes til staten. Pension spares op. Resten får du udbetalt.
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Når upload er færdig, marker analysen som færdig og vis rapporten
  const handleUploadSuccess = (uploadId: string) => {
    setUploadId(uploadId);  // Set the upload ID
    setAnalysisDone(false); // Reset analysis state since we're starting a new one
    setActiveStep(2); // Gå til status-steget
    setTimeout(() => {
      setShowReport(true);
      setActiveStep(3); // Gå til rapport-steget efter en kort pause
    }, 3000);
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