import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PayslipAnimation = () => {
  const [animationStep, setAnimationStep] = useState(0);
  const BLUE = '#007BFF';

  // Progress through animation steps with automatic looping
  useEffect(() => {
    // Reduced timings for faster animation (about 50% faster)
    const timings = [1500, 2000, 2500, 3500, 2500, 2000, 1000]; // Timing for each step in ms
    
    const timeout = setTimeout(() => {
      // Loop back to the beginning when we reach the end
      if (animationStep < 6) {
        setAnimationStep(animationStep + 1);
      } else {
        // Add a slight pause before restarting the animation
        setTimeout(() => {
          setAnimationStep(0);
        }, 500); // Reduced pause between loops
      }
    }, timings[animationStep]);
    
    return () => clearTimeout(timeout);
  }, [animationStep]);

  return (
    <section className="flex flex-col items-center justify-center py-20 bg-white overflow-hidden">
      {/* Stationary headline above animation */}
      <div className="text-center mb-10">
        <h2 className="text-[28px] font-bold text-[#111827]">
          Løntjek, der altid rammer <span style={{ color: BLUE }}>plet</span>
        </h2>
      </div>
      
      <div className="container relative max-w-5xl mx-auto h-[500px] px-4">
        {/* Step 1: Extract payslip data text */}
        <AnimatePresence>
          {animationStep === 0 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} // Faster transition
            >
              <h2 className="text-4xl font-bold text-center">
                Udtræk lønseddeldata. <span style={{ color: BLUE }}>Præcist.</span>
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Step 2: Upload area */}
        <AnimatePresence>
          {animationStep === 1 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} // Faster transition
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md text-center">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }} // Faster transition
                >
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Upload din lønseddel</h3>
                  <p className="mt-1 text-xs text-gray-500">PDF, PNG, JPEG op til 10MB</p>
                </motion.div>
                
                <motion.div 
                  className="mt-6 text-left bg-gray-50 rounded p-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.3 }} // Faster transition
                >
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Lønseddel_Marts2025.pdf</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">162 KB uploadet</span>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, duration: 0.2, type: 'spring' }} // Faster transition
                    >
                      <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Step 3: Floating card */}
        <AnimatePresence>
          {animationStep === 2 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} // Faster transition
            >
              <motion.div 
                className="bg-white border border-blue-500 rounded-lg p-4 shadow-lg max-w-md"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }} // Faster transition
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-500 text-xl font-bold">+</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium">Udtræk løn, skat og pension</h3>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Step 4: Simplified payslip UI with highlighted fields */}
        <AnimatePresence>
          {animationStep === 3 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} // Faster transition
            >
              <div className="bg-gray-100 rounded-lg shadow-lg p-6 w-full max-w-lg">
                <div className="mb-4 border-b border-gray-300 pb-2">
                  <h3 className="text-lg font-bold">Lønseddel Marts 2025</h3>
                  <p className="text-sm text-gray-500">Medarbejder ID: 12345</p>
                </div>
                
                <div className="space-y-4">
                  <motion.div 
                    className="flex justify-between"
                    initial={{ backgroundColor: 'transparent' }}
                    animate={{ backgroundColor: 'rgba(0, 123, 255, 0.1)' }}
                    transition={{ delay: 0.3, duration: 0.5, repeat: 1, repeatType: 'reverse' }} // Faster transition
                  >
                    <span className="font-medium">Bruttoløn:</span>
                    <span>38.500 kr.</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-between"
                    initial={{ backgroundColor: 'transparent' }}
                    animate={{ backgroundColor: 'rgba(0, 123, 255, 0.1)' }}
                    transition={{ delay: 0.8, duration: 0.5, repeat: 1, repeatType: 'reverse' }} // Faster transition
                  >
                    <span className="font-medium">Skat:</span>
                    <span>12.305 kr.</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-between"
                    initial={{ backgroundColor: 'transparent' }}
                    animate={{ backgroundColor: 'rgba(0, 123, 255, 0.1)' }}
                    transition={{ delay: 1.3, duration: 0.5, repeat: 1, repeatType: 'reverse' }} // Faster transition
                  >
                    <span className="font-medium">Pension:</span>
                    <span>3.850 kr.</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-between"
                    initial={{ backgroundColor: 'transparent' }}
                    animate={{ backgroundColor: 'rgba(0, 123, 255, 0.1)' }}
                    transition={{ delay: 1.8, duration: 0.5, repeat: 1, repeatType: 'reverse' }} // Faster transition
                  >
                    <span className="font-medium">Feriepenge:</span>
                    <span>4.620 kr.</span>
                  </motion.div>
                  
                  <div className="border-t border-gray-300 pt-2 mt-4">
                    <motion.div 
                      className="flex justify-between font-bold"
                      initial={{ backgroundColor: 'transparent' }}
                      animate={{ backgroundColor: 'rgba(0, 123, 255, 0.1)' }}
                      transition={{ delay: 2.3, duration: 0.5, repeat: 1, repeatType: 'reverse' }} // Faster transition
                    >
                      <span>Nettoløn:</span>
                      <span>22.345 kr.</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Step 5: Plugin icons */}
        <AnimatePresence>
          {animationStep === 4 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} // Faster transition
            >
              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                  { 
                    title: "Skatte Plugin", 
                    description: "Tjek din skatteberegning", 
                    icon: "M9 14l6-6-4.5-4.5L13 1h10v10l-2.5 2.5L16 10l-6 6-3-3-3 3-3-3 3-3 3 3zm7-11l2 2-2 2 2 2-2 2M3 3l18 18" 
                  },
                  { 
                    title: "Pensions Plugin", 
                    description: "Overvåg dine pensionsopsparinger", 
                    icon: "M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0 18c4.411 0 8-3.589 8-8s-3.589-8-8-8-8 3.589-8 8 3.589 8 8 8zm3.555-14.168l-4.139 2.696-3.193-1.061 3.153 6.964 4.158-2.663 3.126 1.044-3.105-6.98zm-5.087 7.937l-1.78-3.937 1.569.521 1.41-.917 1.202 3.897-1.59.895-1.611-.459z" 
                  },
                  { 
                    title: "Ferie Plugin", 
                    description: "Følg dine optjente feriedage", 
                    icon: "M21 20V6c0-1.1-.9-2-2-2h-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1H8V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM5 9h14V6H5v3zm0 11v-9h14v9H5zm7-14h2v2h-2V6zm0 12h2v-2h-2v2z" 
                  },
                  { 
                    title: "Arbejdstid Plugin", 
                    description: "Analyser arbejdet vs. aftalt tid", 
                    icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" 
                  }
                ].map((plugin, index) => (
                  <motion.div 
                    key={plugin.title}
                    className="bg-white rounded-lg shadow p-4 border border-gray-200 flex items-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.3, duration: 0.4 }} // Faster transition
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={plugin.icon} />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">{plugin.title}</h3>
                      <p className="text-xs text-gray-500">{plugin.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Step 6: Modular dashboard */}
        <AnimatePresence>
          {animationStep === 5 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} // Faster transition
            >
              <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                {[
                  { title: "Skatteprocent", value: "31,9%", change: "+0,5%" },
                  { title: "Feriedage", value: "6,2 dage", change: "dette kvartal" },
                  { title: "AM-bidrag", value: "3.080 kr.", change: "8%" }
                ].map((metric, index) => (
                  <motion.div 
                    key={metric.title}
                    className="bg-white rounded-lg shadow p-4 border border-gray-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.3 }} // Faster transition
                  >
                    <h3 className="text-sm text-gray-500">{metric.title}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-semibold">{metric.value}</span>
                      <span className="ml-2 text-xs text-gray-500">{metric.change}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Step 7: Final CTA */}
        <AnimatePresence>
          {animationStep === 6 && (
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} // Faster transition
            >
              <motion.h2 
                className="text-3xl font-bold mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }} // Faster transition
              >
                Din lønseddel. Din indsigt. Din kontrol.
              </motion.h2>
              
              <motion.button 
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-600 transition-colors"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }} // Faster transition
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Prøv PayTjek Gratis
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Stationary description text below animation */}
      <div className="text-center mt-10">
        <p className="text-[16px] font-normal text-[#6B7280] max-w-3xl mx-auto">
          PayTjek finder lønfejl hurtigt og præcist – uanset hvilken overenskomst, kontrakt eller arbejdstidsopgørelse, du arbejder efter.
        </p>
      </div>
    </section>
  );
};

export default PayslipAnimation; 