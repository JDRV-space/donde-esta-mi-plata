import React, { useState, useEffect } from 'react';
import { useTranslation } from '../LanguageContext';

interface OnboardingProps {
  onComplete: () => void;
}

const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    setDisplayed('');
    if (!text) return;

    // Calculate typing speed to ensure text finishes within ~3 seconds
    // Minimum 20ms delay to avoid instant appearance
    const maxDuration = 3000;
    const charDelay = Math.max(20, Math.min(60, maxDuration / text.length));

    const timer = setInterval(() => {
      setDisplayed((prev) => {
        if (prev.length < text.length) {
          return text.slice(0, prev.length + 1);
        }
        clearInterval(timer);
        return prev;
      });
    }, charDelay);

    return () => clearInterval(timer);
  }, [text]);

  return <>{displayed}</>;
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();

  const steps = [
    {
      title: t('onboarding.step1.title'),
      desc: t('onboarding.step1.desc'),
      icon: "fa-eye"
    },
    {
      title: t('onboarding.step2.title'),
      desc: t('onboarding.step2.desc'),
      icon: "fa-database"
    },
    {
      title: t('onboarding.step3.title'),
      desc: t('onboarding.step3.desc'),
      icon: "fa-microchip"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const getStepStyles = (idx: number) => {
    switch(idx) {
        case 0: return { bg: 'bg-black', text: 'text-retro-amber', border: 'border-retro-amber' };
        case 1: return { bg: 'bg-retro-orange', text: 'text-white', border: 'border-white' };
        case 2: return { bg: 'bg-retro-amber', text: 'text-black', border: 'border-black' };
        default: return { bg: 'bg-retro-amber', text: 'text-black', border: 'border-black' };
    }
  };

  const currentStep = steps[step];
  const styles = getStepStyles(step);

  return (
    <div className={`fixed inset-0 z-[5000] ${styles.bg} flex flex-col items-center justify-center p-6 text-black overflow-hidden transition-colors duration-500`}>
      
      {/* Decorative scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%]"></div>
      
      <div className={`w-full max-w-md flex flex-col items-center text-center relative z-10 border-4 ${styles.border} bg-retro-paper p-8 shadow-[8px_8px_0_0_#000]`}>
        
        <div className={`w-24 h-24 bg-retro-dark border-4 border-black rounded-full flex items-center justify-center mb-8 shadow-[4px_4px_0_0_#D94F00]`}>
             <i className={`fa-solid ${currentStep.icon} text-4xl text-retro-amber`}></i>
        </div>

        <h1 className="text-3xl font-serif font-black mb-4 text-black uppercase tracking-wider">
            {currentStep.title}
        </h1>

        <div className="bg-black border border-gray-600 p-4 mb-8 w-full shadow-retro-sm min-h-[100px] flex items-center justify-center">
            <p className={`text-lg ${styles.text === 'text-black' ? 'text-retro-amber' : 'text-retro-amber'} font-mono leading-relaxed typewriter`}>
                {">"} <TypewriterText text={currentStep.desc} /><span className="animate-pulse">_</span>
            </p>
        </div>
        
        <div className="flex gap-4 mb-8">
            {steps.map((_, i) => (
                <div key={i} className={`h-4 w-4 border-2 border-black ${i === step ? 'bg-retro-orange' : 'bg-transparent'}`}></div>
            ))}
        </div>

        <button 
            onClick={handleNext}
            className="w-full bg-black text-white font-mono font-bold text-lg py-4 border-4 border-black shadow-[4px_4px_0_0_#D94F00] hover:translate-y-1 hover:shadow-none transition-all uppercase hover:bg-retro-orange hover:text-black"
        >
            {step === steps.length - 1 ? t('onboarding.start') : t('onboarding.next')}
        </button>

      </div>
    </div>
  );
};