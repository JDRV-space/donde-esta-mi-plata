import React, { useState, useEffect, useRef } from 'react';
import { analyzeImageWithGemini } from '../services/geminiService';
import { AggregatedDistrictData, GeminiAnalysisResult, CATEGORY_MAPPING } from '../types';
import { formatCurrency } from '../utils/dataProcessing';
import { useTranslation } from '../LanguageContext';

interface ReportFlowProps {
  imageFile: File;
  districts: AggregatedDistrictData[];
  onClose: () => void;
}

interface MunicipalityMessage {
  fullText: string;
  district: string;
  problemType: string;
  coordinates: { lat: number; lng: number } | null;
  budgetAllocated: number;
  budgetSpent: number;
  budgetRemaining: number;
  estimatedCost: number;
  userDescription: string;
  trackingId: string;
  emailSubject: string;
  emailTo: string;
}

export const ReportFlow: React.FC<ReportFlowProps> = ({ imageFile, districts, onClose }) => {
  const { t, language } = useTranslation();
  const [step, setStep] = useState<'analyzing' | 'rejection' | 'result' | 'success' | 'municipality'>('analyzing');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [matchedDistrict, setMatchedDistrict] = useState<AggregatedDistrictData | null>(null);
  const [userDescription, setUserDescription] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingId, setTrackingId] = useState<string>('');
  const [municipalityMessage, setMunicipalityMessage] = useState<MunicipalityMessage | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);

    // Generate tracking ID
    const newTrackingId = `DEMP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    setTrackingId(newTrackingId);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        if (districts.length > 0) {
            let closest = districts[0];
            let minDist = Infinity;
            districts.forEach(d => {
                const dist = Math.sqrt(Math.pow(d.latitude - loc.lat, 2) + Math.pow(d.longitude - loc.lng, 2));
                if (dist < minDist) {
                    minDist = dist;
                    closest = d;
                }
            });
            if (minDist < 0.1) {
              setMatchedDistrict(closest);
            } else {
               setMatchedDistrict(districts.find(d => d.district === 'LIMA') || districts[0]);
            }
        }
      },
      (err) => {
        setMatchedDistrict(districts.find(d => d.district === 'LIMA') || districts[0]);
      }
    );

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await analyzeImageWithGemini(base64, language);
        setAnalysis(result);

        if (!result.is_relevant) {
            setStep('rejection');
        } else {
            setStep('result');
        }
      } catch (error) {
        console.error(error);
        alert(t('flow.error_analyzing'));
        onClose();
      }
    };
    reader.readAsDataURL(imageFile);

    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  const generateMunicipalityMessage = (): MunicipalityMessage => {
    const budgetCatName = CATEGORY_MAPPING[analysis?.problem_type || 'other'];
    const districtBudget = matchedDistrict?.categories[budgetCatName];

    const allocated = districtBudget?.pim || 0;
    const spent = districtBudget?.devengado || 0;
    const remaining = allocated - spent;

    const today = new Date();
    const dateStr = today.toLocaleDateString(language === 'en' ? 'en-US' : 'es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const fullText = `
===============================================
${t('formalRequest')}
${t('citizenComplaint')}
===============================================

${language === 'en' ? 'Date' : 'Fecha'}: ${dateStr}
${language === 'en' ? 'Tracking Code' : 'Codigo de Seguimiento'}: ${trackingId}

-----------------------------------------------
1. ${t('locationInfo').toUpperCase()}
-----------------------------------------------
${language === 'en' ? 'District' : 'Distrito'}: ${matchedDistrict?.district || 'No identificado'}
${t('gpsCoordinates')}: ${userLocation ? `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}` : 'No disponible'}

-----------------------------------------------
2. ${language === 'en' ? 'DETECTED PROBLEM (AI Analysis)' : 'PROBLEMA DETECTADO (Analisis de IA)'}
-----------------------------------------------
${language === 'en' ? 'Type' : 'Tipo'}: ${t(`problem.${analysis?.problem_type}`).toUpperCase() || 'No identificado'}
${language === 'en' ? 'Severity' : 'Severidad'}: ${analysis?.severity || 'N/A'}/5
${language === 'en' ? 'Technical Description' : 'Descripcion tecnica'}: ${analysis?.description || 'Sin descripcion'}
${language === 'en' ? 'Safety Risk' : 'Riesgo de seguridad'}: ${analysis?.safety_hazard ? (language === 'en' ? 'YES' : 'SI') : 'NO'}

-----------------------------------------------
3. ${language === 'en' ? 'BUDGET INFORMATION' : 'INFORMACION PRESUPUESTAL'}
-----------------------------------------------
${language === 'en' ? 'Category' : 'Categoria'}: ${t(`category.${budgetCatName}`)}
${language === 'en' ? 'Allocated Budget (PIM)' : 'Presupuesto asignado (PIM)'}: ${formatCurrency(allocated)}
${language === 'en' ? 'Executed Budget' : 'Presupuesto ejecutado'}: ${formatCurrency(spent)} (${districtBudget?.pct?.toFixed(1) || 0}%)
${t('budgetAvailable')}: ${formatCurrency(remaining)}

-----------------------------------------------
4. ${t('estimatedCost').toUpperCase()}
-----------------------------------------------
${formatCurrency(analysis?.estimated_repair_cost_soles || 0)}

-----------------------------------------------
5. ${t('userComplaint').toUpperCase()}
-----------------------------------------------
"${userDescription || (language === 'en' ? 'No additional comments' : 'Sin comentarios adicionales')}"

-----------------------------------------------
6. ${t('photoAttached').toUpperCase()}
-----------------------------------------------
[${language === 'en' ? 'Attach the photo of the report' : 'Adjuntar la foto del reporte'}]

===============================================
${language === 'en' ? 'FORMAL REQUEST' : 'SOLICITUD FORMAL'}
===============================================

${t('requestResponse')}

${language === 'en' ? 'Sincerely,' : 'Atentamente,'}
${language === 'en' ? 'Citizen of' : 'Ciudadano de'} ${matchedDistrict?.district || 'Lima'}
${language === 'en' ? 'System Where is my money?' : 'Sistema Donde Esta Mi Plata?'} - ${trackingId}

---
${language === 'en' ? 'Generated automatically by dondeestamiplata.pe' : 'Generado automaticamente por dondeestamiplata.pe'}
${language === 'en' ? 'To track: dondeestamiplata.pe/track/' : 'Para dar seguimiento: dondeestamiplata.pe/seguimiento/'}${trackingId}
`.trim();

    // Generate email subject
    const problemTypeFormatted = (t(`problem.${analysis?.problem_type}`) || 'problema').toUpperCase();
    const emailSubject = `${t('citizenComplaint')} - ${matchedDistrict?.district || 'LIMA'} - ${problemTypeFormatted} - ${trackingId}`;

    // Municipality email placeholder (in real app, this would come from district data)
    const emailTo = `municipalidad_${(matchedDistrict?.district || 'lima').toLowerCase().replace(/\s+/g, '')}@gob.pe`;

    return {
      fullText,
      district: matchedDistrict?.district || 'No identificado',
      problemType: analysis?.problem_type || 'other',
      coordinates: userLocation,
      budgetAllocated: allocated,
      budgetSpent: spent,
      budgetRemaining: remaining,
      estimatedCost: analysis?.estimated_repair_cost_soles || 0,
      userDescription,
      trackingId,
      emailSubject,
      emailTo
    };
  };

  const handleSendEmail = () => {
    if (!municipalityMessage) return;

    // Build mailto URL with encoded subject and body
    const subject = encodeURIComponent(municipalityMessage.emailSubject);
    const body = encodeURIComponent(municipalityMessage.fullText);
    const mailtoUrl = `mailto:${municipalityMessage.emailTo}?subject=${subject}&body=${body}`;

    // Open email client
    window.location.href = mailtoUrl;
  };

  const handleDownloadReport = async () => {
    if (!municipalityMessage || !messageRef.current) return;

    // Use html2canvas if available, otherwise fallback to text download
    try {
      // Try to dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(messageRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      // Download as PNG
      const link = document.createElement('a');
      link.download = `reporte-${municipalityMessage.trackingId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      // Fallback: download as text file
      const blob = new Blob([municipalityMessage.fullText], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `reporte-${municipalityMessage.trackingId}.txt`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const handleSendReport = () => {
    setStep('success');
  };

  const handleSendToMunicipality = () => {
    const message = generateMunicipalityMessage();
    setMunicipalityMessage(message);
    setStep('municipality');
  };

  const handleCopyMessage = async () => {
    if (municipalityMessage) {
      try {
        await navigator.clipboard.writeText(municipalityMessage.fullText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = municipalityMessage.fullText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  if (step === 'analyzing') {
    return (
      <div className="fixed inset-0 z-[2000] bg-retro-dark flex flex-col items-center justify-center p-6">
        <div className="bg-retro-paper border-4 border-retro-amber shadow-retro p-8 w-full max-w-sm text-center">
            <div className="text-4xl text-retro-amber animate-spin mb-4">
                <i className="fa-solid fa-gear"></i>
            </div>
            <h2 className="text-xl font-serif font-black text-black mb-2 uppercase">{t('flow.processing')}</h2>
            <p className="text-xs font-mono text-retro-orange mb-6">{t('flow.connecting')}</p>
            <div className="border-2 border-black p-1 bg-white shadow-retro-sm">
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover grayscale contrast-125" />}
            </div>
        </div>
      </div>
    );
  }

  if (step === 'rejection') {
    return (
      <div className="fixed inset-0 z-[2000] bg-black/90 flex flex-col items-center justify-center p-6">
        <div className="bg-retro-paper border-4 border-retro-orange shadow-retro p-8 w-full max-w-sm text-center relative">
            <button onClick={onClose} className="absolute top-2 right-2 text-black hover:text-retro-orange"><i className="fa-solid fa-times text-xl"></i></button>
            <div className="text-4xl text-retro-orange mb-4">
                <i className="fa-solid fa-ban"></i>
            </div>
            <h2 className="text-xl font-serif font-black text-black mb-2 uppercase">{t('flow.not_relevant')}</h2>
            <p className="text-sm font-mono text-gray-700 mb-6">
                {t('flow.ai_rejection')}
            </p>
            <p className="text-xs font-mono text-red-600 bg-red-100 p-2 border border-red-300 mb-6 italic">
                "{analysis?.relevance_reason || t('flow.rejection_reason_default')}"
            </p>
            <button
                onClick={onClose}
                className="w-full bg-black text-white py-3 font-mono font-bold uppercase hover:bg-retro-orange transition-colors border-2 border-transparent hover:border-black"
            >
                {t('flow.retry')}
            </button>
        </div>
      </div>
    );
  }

  // Municipality Message Modal
  if (step === 'municipality' && municipalityMessage) {
    return (
      <div className="fixed inset-0 z-[2000] bg-retro-paper flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="bg-black text-white p-4 flex items-center justify-between border-b-4 border-retro-amber">
          <button
            onClick={() => setStep('success')}
            className="w-10 h-10 flex items-center justify-center hover:bg-retro-orange transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-lg font-serif font-bold">{t('municipalityMessageTitle')}</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-4 font-mono pb-32">
          {/* Instructions */}
          <div className="bg-retro-amber/20 border-2 border-retro-amber p-3 text-xs">
            <p className="font-bold mb-1"><i className="fa-solid fa-info-circle mr-1"></i> {language === 'en' ? 'Instructions:' : 'Instrucciones:'}</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>{language === 'en' ? 'Click "Send Email" to open your mail client' : 'Haz clic en "Enviar Email" para abrir tu cliente de correo'}</li>
              <li>{language === 'en' ? 'Attach the problem photo to the email' : 'Adjunta la foto del problema al correo'}</li>
              <li>{language === 'en' ? 'Download report for your records' : 'Descarga el reporte para tus registros'}</li>
              <li>{language === 'en' ? 'Keep code' : 'Guarda el codigo'} <strong>{municipalityMessage.trackingId}</strong> {language === 'en' ? 'for tracking' : 'para seguimiento'}</li>
            </ol>
          </div>

          {/* Email destination info */}
          <div className="bg-gray-100 border-2 border-gray-300 p-3 text-xs">
            <p className="font-bold text-gray-700 mb-1"><i className="fa-solid fa-envelope mr-1"></i> {language === 'en' ? 'Recipient:' : 'Destinatario:'}</p>
            <p className="font-mono text-retro-orange">{municipalityMessage.emailTo}</p>
            <p className="text-gray-500 mt-1 italic text-[10px]">
                {language === 'en' 
                    ? '* Example email for MVP. In production, this would be real municipality email.' 
                    : '* Email de ejemplo para MVP. En produccion usaria emails reales de municipios.'}
            </p>
          </div>

          {/* Message Preview */}
          <div
            ref={messageRef}
            className="bg-white border-2 border-black shadow-retro p-4 text-xs whitespace-pre-wrap font-mono max-h-96 overflow-y-auto"
          >
            {municipalityMessage.fullText}
          </div>

          {/* Photo reminder */}
          <div className="bg-gray-100 border-2 border-dashed border-gray-400 p-3 flex items-center gap-3">
            <div className="w-16 h-16 border border-black overflow-hidden flex-shrink-0">
              <img src={previewUrl} alt="Foto" className="w-full h-full object-cover" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-retro-orange"><i className="fa-solid fa-camera mr-1"></i> {t('photoAttached')}</p>
              <p className="text-gray-600">{language === 'en' ? 'Remember to attach this photo when sending the message' : 'Recuerda adjuntar esta foto cuando envies el mensaje'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-retro-paper border-t-4 border-black p-4 space-y-2">
          {/* Primary: Send Email */}
          <button
            onClick={handleSendEmail}
            className="w-full py-3 bg-retro-amber text-black font-bold uppercase border-4 border-black shadow-retro hover:bg-retro-orange hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-paper-plane"></i> {t('sendEmail')}
          </button>

          {/* Secondary: Download Report */}
          <button
            onClick={handleDownloadReport}
            className="w-full py-3 bg-black text-white font-bold uppercase border-4 border-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-download"></i> {t('downloadReport')}
          </button>

          {/* Tertiary: Copy (fallback) */}
          <button
            onClick={handleCopyMessage}
            className="w-full py-2 bg-transparent text-gray-600 font-bold uppercase border-2 border-gray-400 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <i className="fa-solid fa-copy"></i> {t('copyMessage')}
          </button>

          {copySuccess && (
            <div className="bg-green-100 border border-green-500 text-green-700 p-2 text-center text-xs font-bold">
              <i className="fa-solid fa-check mr-1"></i> {t('messageCopied')}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[2000] bg-retro-paper flex flex-col items-center justify-center p-8">
        <div className="bg-white border-4 border-black shadow-retro p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-retro-amber border-2 border-black text-black rounded-none flex items-center justify-center mb-4 mx-auto text-3xl shadow-retro-sm">
                <i className="fa-solid fa-check"></i>
            </div>
            <h2 className="text-2xl font-serif font-black text-black mb-2 uppercase">{t('flow.sent')}</h2>
            <p className="font-mono text-xs text-gray-500 mb-6 bg-gray-100 p-2 border border-dashed border-gray-400">{t('flow.report_id_prefix')}: {trackingId}</p>

            <div className="w-full bg-retro-paper border-2 border-black p-4 mb-6 text-left font-mono text-xs">
                <h4 className="font-bold uppercase mb-1 text-retro-orange">{t('flow.district')}</h4>
                <p className="border-b border-black pb-2 mb-2">{matchedDistrict?.district}</p>
                <h4 className="font-bold uppercase mb-1 text-retro-orange">{t('flow.category')}</h4>
                <p className="border-b border-black pb-2 mb-2">{t(`problem.${analysis?.problem_type}`)}</p>
                <h4 className="font-bold uppercase mb-1 text-retro-orange">{t('flow.your_desc')}</h4>
                <p className="italic">"{userDescription || t('flow.no_comments')}"</p>
            </div>

            {/* NEW: Send to Municipality Button */}
            <button
                onClick={handleSendToMunicipality}
                className="w-full py-3 mb-3 bg-retro-amber text-black font-mono font-bold uppercase border-4 border-black shadow-retro hover:bg-retro-orange hover:text-white transition-colors flex items-center justify-center gap-2"
            >
                <i className="fa-solid fa-envelope"></i> {t('sendToMunicipality')}
            </button>

            <button
                onClick={onClose}
                className="w-full bg-black text-white py-3 font-mono font-bold uppercase hover:bg-gray-800 transition-colors border-2 border-transparent"
            >
                [ {t('flow.back_home')} ]
            </button>
        </div>
      </div>
    );
  }

  // Result View (Input Flow)
  const budgetCatName = CATEGORY_MAPPING[analysis?.problem_type || 'other'];
  const districtBudget = matchedDistrict?.categories[budgetCatName];

  return (
    <div className="fixed inset-0 z-[2000] bg-retro-paper flex flex-col h-full overflow-y-auto">
      {/* Header Image */}
      <div className="relative h-48 w-full flex-shrink-0 border-b-4 border-black">
        <img src={previewUrl} alt="Issue" className="w-full h-full object-cover grayscale contrast-125" />
        <div className="absolute inset-0 bg-retro-amber mix-blend-multiply opacity-40"></div>
        <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 bg-black text-white border-2 border-white flex items-center justify-center hover:bg-retro-orange transition-colors shadow-retro-sm"
        >
            <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
             <h1 className="text-lg font-serif font-bold text-white pl-2">{t('flow.new_citizen_report')}</h1>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 font-mono pb-24">

        {/* Card 1: AI Categorization & Budget */}
        <div className="bg-white border-2 border-black shadow-retro p-4 relative">
            <div className="absolute -top-3 left-4 bg-black text-retro-amber px-2 py-1 text-xs font-bold border border-retro-amber">
                <i className="fa-solid fa-robot mr-1"></i> {t('flow.ai_analysis')}
            </div>

            <div className="mt-2 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase">{t('flow.problem')}</p>
                        <p className="text-lg font-bold text-black uppercase leading-none">{t(`problem.${analysis?.problem_type}`)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase">{t('flow.est_cost')}</p>
                        <p className="text-sm font-bold text-retro-orange">{formatCurrency(analysis?.estimated_repair_cost_soles || 0)}</p>
                    </div>
                </div>

                <div className="bg-gray-100 p-2 border border-gray-300 text-xs italic">
                    "{analysis?.description}"
                </div>

                {/* Budget Context */}
                {districtBudget && (
                     <div className="border-t border-dashed border-gray-400 pt-2 mt-1">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-600 mb-1">
                            <span>{t('flow.budget_item')}: {t(`category.${budgetCatName}`)}</span>
                        </div>
                        <div className="w-full bg-gray-300 h-2 border border-black">
                            <div
                                className={`h-full ${districtBudget.pct < 50 ? 'bg-retro-orange' : 'bg-green-600'}`}
                                style={{ width: `${Math.min(districtBudget.pct, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-right mt-1 text-gray-500">
                            {districtBudget.pct.toFixed(1)}% {t('flow.executed_dist')}
                        </p>
                     </div>
                )}
            </div>
        </div>

        {/* Card 2: User Input */}
        <div className="bg-white border-2 border-black shadow-retro p-4 relative mt-2">
            <div className="absolute -top-3 left-4 bg-retro-orange text-white px-2 py-1 text-xs font-bold border border-black">
                <i className="fa-solid fa-pen mr-1"></i> {t('flow.user_desc_title')}
            </div>

            <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">{t('flow.user_hint')}</p>
                <textarea
                    className="w-full h-32 border-2 border-gray-300 p-3 font-mono text-sm focus:border-black focus:outline-none bg-retro-paper"
                    placeholder={t('flow.placeholder')}
                    value={userDescription}
                    onChange={(e) => setUserDescription(e.target.value)}
                ></textarea>
            </div>
        </div>

        <button
            onClick={handleSendReport}
            disabled={userDescription.length < 5}
            className={`mt-4 w-full py-4 font-serif font-black uppercase text-xl border-4 border-black shadow-retro transition-all flex items-center justify-center gap-2 mb-4 ${userDescription.length < 5 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-retro-amber text-black hover:translate-y-1 hover:shadow-none hover:bg-retro-orange hover:text-white'}`}
        >
            <i className="fa-solid fa-paper-plane"></i> {t('flow.send_btn')}
        </button>
      </div>
    </div>
  );
};