import React from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { useTranslation } from '../LanguageContext';

interface ReportDetailProps {
  report: any;
  onClose: () => void;
  onToggleStatus: (id: number) => void;
}

export const ReportDetailView: React.FC<ReportDetailProps> = ({ report, onClose }) => {
  const currentStep = report.status === 'verified' ? 4 : 2;
  const { t } = useTranslation();

  const steps = [
    { label: t('detail.step_log'), id: 1 },
    { label: t('detail.step_sent'), id: 2 },
    { label: t('detail.step_ack'), id: 3 },
    { label: t('detail.step_fix'), id: 4 },
  ];

  return (
    <div className="fixed inset-0 z-[6000] bg-black/80 flex flex-col justify-center items-center backdrop-blur-sm p-4">
      
      <div className="bg-retro-paper w-full max-w-lg border-4 border-black shadow-[8px_8px_0_0_#D94F00] flex flex-col overflow-hidden h-[85vh]">
        
        {/* Header */}
        <div className="p-3 flex justify-between items-center border-b-4 border-black bg-retro-dark text-white">
          <h2 className="text-lg font-mono font-bold uppercase text-retro-amber">
            {t('detail.log_prefix')} {report.id.toString().padStart(4, '0')}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-retro-orange border-2 border-white flex items-center justify-center text-white hover:bg-white hover:text-retro-orange"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0 font-mono">
            {/* Image */}
            <div className="relative h-64 border-b-4 border-black">
                <img 
                    src={report.image || `https://placehold.co/600x400/333/fff?text=IMG_${report.id}`} 
                    alt="Evidence" 
                    className="w-full h-full object-cover grayscale contrast-125"
                />
                <div className="absolute top-2 left-2 bg-black text-retro-amber text-xs px-2 py-1 font-mono border border-retro-amber">
                    {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Status Tracker */}
                <div className="bg-white border-2 border-black p-4">
                    <h3 className="text-xs font-bold text-black uppercase mb-4 border-b-2 border-gray-300 pb-1">{t('detail.status_seq')}</h3>
                    <div className="flex justify-between items-center gap-1">
                        {steps.map((step, idx) => {
                            const isActive = step.id <= currentStep;
                            return (
                                <div key={step.id} className="flex-1 flex flex-col items-center gap-2">
                                    <div className={`w-full h-2 border border-black ${isActive ? 'bg-retro-amber' : 'bg-gray-200'}`}></div>
                                    <span className={`text-[10px] font-bold ${isActive ? 'text-black' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-black p-3">
                        <label className="text-[10px] text-gray-500 block mb-1 uppercase">{t('detail.district')}</label>
                        <div className="font-bold text-retro-orange uppercase">{report.district}</div>
                    </div>
                    <div className="bg-white border-2 border-black p-3">
                        <label className="text-[10px] text-gray-500 block mb-1 uppercase">{t('detail.type')}</label>
                        <div className="font-bold text-retro-orange uppercase">{report.type}</div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-black block mb-2 uppercase bg-retro-amber px-1 w-max border border-black">{t('detail.desc')}</label>
                    <p className="text-black bg-white p-4 border-2 border-black font-sans leading-relaxed shadow-retro-sm">
                    "{report.desc}"
                    </p>
                </div>

                {/* Mini Map */}
                <div className="h-40 border-2 border-black relative">
                    <MapContainer 
                        center={[report.lat || -12.0464, report.lng || -77.0428]} 
                        zoom={15} 
                        className="h-full w-full bg-gray-300 grayscale"
                        zoomControl={false}
                        scrollWheelZoom={false}
                        dragging={false}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        <CircleMarker center={[report.lat || -12.0464, report.lng || -77.0428]} radius={8} pathOptions={{ color: '#000', fillColor: '#FFBF00', fillOpacity: 1, weight: 2 }} />
                    </MapContainer>
                    <div className="absolute bottom-1 right-1 bg-white border border-black px-1 text-[10px] z-[1000]">
                        {t('detail.lat')}: {report.lat} {t('detail.lng')}: {report.lng}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};