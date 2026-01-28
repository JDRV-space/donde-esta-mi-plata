import React from 'react';
import { AggregatedDistrictData } from '../types';
import { MOCK_REPORTS } from '../constants';
import { formatCurrency } from '../utils/dataProcessing';
import { useTranslation } from '../LanguageContext';

interface ReportViewProps {
  onCapture: (file: File) => void;
  currentDistrict: AggregatedDistrictData | null;
  onViewAllReports: (reportId?: number) => void;
}

interface CategoryData {
  pim: number;
  devengado: number;
  pct: number;
}

export const ReportView: React.FC<ReportViewProps> = ({ onCapture, currentDistrict, onViewAllReports }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
    }
  };

  const { t } = useTranslation();

  const recentReports = MOCK_REPORTS.slice(0, 3);

  // Stats Logic
  const executionPct = currentDistrict ? currentDistrict.execution_pct : 0;
  const pieStyle = {
    background: `conic-gradient(#FFBF00 0% ${executionPct}%, #333333 ${executionPct}% 100%)`
  };

  const topCategories = currentDistrict 
    ? Object.entries(currentDistrict.categories)
        .sort(([, a], [, b]) => (b as CategoryData).pim - (a as CategoryData).pim)
        .slice(0, 3)
    : [];

  return (
    <div className="flex flex-col h-full p-6 pb-24 overflow-y-auto bg-retro-paper">
      
      {/* Location Status Badge */}
      <div className="mb-6 border-2 border-black bg-white p-3 shadow-retro flex justify-between items-center">
        <div>
            <p className="text-[10px] font-mono font-bold uppercase text-gray-500">{t('home.location_detected')}</p>
            <h2 className="text-xl font-serif font-black text-retro-orange uppercase tracking-wide">
                {currentDistrict ? currentDistrict.district : t('home.locating')}
            </h2>
        </div>
        <div className="bg-retro-amber text-black border-2 border-black px-2 py-1 text-xs font-mono font-bold animate-pulse shadow-[2px_2px_0_0_#000]">
            <i className="fa-solid fa-satellite-dish mr-1"></i> {t('home.gps_on')}
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 mb-8">
        
        {/* Left: Action Card (Split into two buttons) */}
        <div className="h-full mb-8 md:mb-0 min-h-[250px] flex flex-col gap-4">
          {/* 1. Take Photo Button */}
          <label 
            htmlFor="camera-input-direct"
            className="flex-1 bg-retro-dark p-4 border-4 border-double border-retro-gray cursor-pointer shadow-retro hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group flex flex-col items-center justify-center relative overflow-hidden"
          >
              <div className="absolute inset-0 bg-gray-800/50 group-hover:bg-gray-800/30 transition-colors"></div>
              <div className="w-16 h-16 bg-retro-amber rounded-full flex items-center justify-center mb-2 border-4 border-white group-hover:bg-retro-orange transition-colors z-10">
                  <i className="fa-solid fa-camera text-3xl text-black"></i>
              </div>
              <h3 className="text-lg font-serif font-bold text-retro-paper uppercase tracking-wider group-hover:text-retro-amber transition-colors z-10">{t('home.take_photo')}</h3>
              <p className="text-[10px] font-mono text-retro-orange mt-1 z-10">{t('home.start_ai')}</p>
          </label>
          <input 
            id="camera-input-direct" 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleFileChange}
          />

          {/* 2. Upload from Gallery Button */}
          <label 
            htmlFor="gallery-input"
            className="h-16 bg-white cursor-pointer border-2 border-black shadow-retro-sm hover:bg-gray-50 hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-3 px-4"
          >
              <i className="fa-solid fa-image text-xl text-gray-700"></i>
              <span className="font-mono font-bold text-sm text-black uppercase">{t('home.upload_gallery')}</span>
          </label>
          <input 
            id="gallery-input" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>

        {/* Right: District Stats Summary */}
        <div className="flex flex-col bg-white border-2 border-black shadow-retro p-6 h-full justify-between min-h-[250px]">
            <div className="border-b-4 border-black pb-2 mb-4 flex justify-between items-end">
                <h3 className="font-serif font-black text-xl text-black uppercase">{t('home.district_status')}</h3>
                <span className="text-xs font-mono bg-retro-amber px-1 border border-black text-black font-bold">2025</span>
            </div>
            
            {currentDistrict ? (
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-6 mb-auto">
                        {/* Pie Chart */}
                        <div className="relative w-32 h-32 rounded-full border-4 border-black shrink-0 shadow-retro-sm" style={pieStyle}>
                            <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-black">
                                <div className="text-center leading-none">
                                    <span className="block text-lg font-black">{executionPct.toFixed(0)}%</span>
                                    <span className="text-[8px] font-bold uppercase">{t('home.executed')}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Top Categories */}
                        <div className="flex-1 space-y-3 font-mono">
                            <p className="text-xs font-bold uppercase border-b border-gray-300 pb-1">{t('home.top_budgets')}</p>
                            {topCategories.map(([catName, val]) => {
                                const data = val as CategoryData;
                                return (
                                <div key={catName}>
                                    <div className="flex justify-between text-[10px] uppercase font-bold mb-0.5">
                                        <span className="truncate max-w-[120px]">{t(`category.${catName}`)}</span>
                                        <span>{data.pct.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-2 border border-black">
                                        <div className="bg-retro-orange h-full" style={{ width: `${data.pct}%` }}></div>
                                    </div>
                                    <div className="text-[10px] text-gray-500 text-right">{formatCurrency(data.pim)}</div>
                                </div>
                            )})}
                        </div>
                    </div>
                    
                    {/* Disclaimer */}
                    <div className="mt-4 text-[9px] text-gray-500 italic border-t border-gray-200 pt-2 text-center">
                        <i className="fa-solid fa-database mr-1"></i> {t('app.gov_disclaimer')}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 font-mono text-sm animate-pulse">
                    {t('home.no_data')}
                </div>
            )}
        </div>

      </div>

      {/* Recent Activity */}
      <div className="flex-1">
        <div className="flex justify-between items-end mb-4 border-b-4 border-black pb-2">
            <h3 className="font-serif font-black text-xl text-black uppercase">
                {t('home.recent_activity')}
            </h3>
            <button onClick={() => onViewAllReports()} className="text-xs font-mono font-bold text-retro-orange hover:text-black hover:bg-retro-amber hover:px-1 transition-all uppercase">
                {t('home.view_logs')}
            </button>
        </div>

        <div className="space-y-4">
            {recentReports.map((report) => (
                <div 
                    key={report.id} 
                    onClick={() => onViewAllReports(Number(report.id))}
                    className="bg-white p-3 border-2 border-black shadow-retro-sm flex items-start gap-3 cursor-pointer hover:bg-retro-paper transition-colors group"
                >
                    <div className={`w-12 h-12 border-2 border-black flex items-center justify-center shrink-0 font-bold text-lg ${report.status === 'verified' ? 'bg-retro-amber text-black' : 'bg-gray-200 text-gray-500'}`}>
                        <i className={`fa-solid ${report.icon}`}></i>
                    </div>
                    <div className="flex-1 min-w-0 font-mono">
                        <div className="flex justify-between mb-1 items-center">
                            <h4 className="text-sm font-bold text-black uppercase truncate group-hover:text-retro-orange transition-colors">{t(`problem.${report.analysis.problem_type}`)}</h4>
                            <span className="text-[10px] text-white bg-black px-2 py-0.5">{t('time.hrs_ago').replace('{n}', report.hoursAgo.toString())}</span>
                        </div>
                        <div className="text-[10px] font-bold text-retro-orange uppercase mb-1">{report.district}</div>
                        <p className="text-xs text-gray-600 truncate font-sans italic">
                            "{t('app.mock_desc_pattern')
                                .replace('{problem}', t(`problem.${report.analysis.problem_type}`).toLowerCase())
                                .replace('{district}', report.district)}"
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};