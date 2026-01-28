import React, { useEffect, useState } from 'react';
import { AggregatedDistrictData } from '../types';
import { formatCurrency } from '../utils/dataProcessing';
import { fetchEconomicIndicators, BcrpIndicator } from '../services/bcrpService';
import { useTranslation } from '../LanguageContext';

interface DistrictSummaryCardProps {
  district: AggregatedDistrictData;
  reports?: any[]; // Passed down to calculate summaries
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onReportSelect?: (reportId: number) => void;
}

export const DistrictSummaryCard: React.FC<DistrictSummaryCardProps> = ({ district, reports = [], onClose, onNext, onPrev, onReportSelect }) => {
  const [bcrpData, setBcrpData] = useState<BcrpIndicator[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const loadBcrp = async () => {
        const data = await fetchEconomicIndicators();
        setBcrpData(data);
    };
    loadBcrp();
  }, []);

  const categories = Object.entries(district.categories)
    .map(([name, data]) => {
      const catData = data as { pim: number; devengado: number; pct: number };
      return { name, ...catData };
    })
    .sort((a, b) => b.pct - a.pct); // Sort high to low

  // Filter and sort reports for this district (most recent first)
  const districtReports = reports
    .filter(r => r.district === district.district)
    .sort((a, b) => (a.hoursAgo || 0) - (b.hoursAgo || 0))
    .slice(0, 4); // Take top 4

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[60vh] md:h-[50vh] bg-retro-paper border-t-4 border-black shadow-[0_-5px_0px_rgba(0,0,0,1)] z-[5000] flex flex-col animate-[slideUp_0.3s_ease-out]">
      
      {/* Header Bar - Amber Background */}
      <div className="bg-retro-amber text-black px-4 py-3 flex justify-between items-center border-b-4 border-black shrink-0">
        <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-white bg-black px-1 inline-block w-max mb-1">{t('card.selected')}</span>
            <h2 className="text-xl font-serif font-black uppercase tracking-wide leading-none">{district.district}</h2>
        </div>
        <button onClick={onClose} className="w-8 h-8 bg-black border-2 border-white flex items-center justify-center hover:bg-retro-orange transition-colors">
            <i className="fa-solid fa-times text-white"></i>
        </button>
      </div>

      {/* BCRP Data Ticker (New) */}
      <div className="bg-gray-100 border-b border-black py-1 px-4 overflow-hidden whitespace-nowrap">
         <div className="inline-flex gap-6 animate-marquee text-[10px] font-mono font-bold uppercase text-gray-600">
            <span><i className="fa-solid fa-chart-line mr-1"></i> {t('card.bcrp_label')}</span>
            {bcrpData.length > 0 ? bcrpData.map((ind, i) => (
                <span key={i} className="text-black">
                    {ind.name}: <span className="text-retro-orange">{ind.value}</span> ({ind.period})
                </span>
            )) : <span>{t('card.loading_bcrp')}</span>}
            {/* Repeat for smooth marquee if needed */}
            <span className="text-gray-400">|</span>
            <span>{t('card.source')}</span>
         </div>
      </div>

      {/* Navigation & Summary Bar */}
      <div className="bg-black text-white px-4 py-2 flex justify-between items-center border-b-4 border-retro-orange shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={onPrev} className="hover:text-retro-amber transition-colors"><i className="fa-solid fa-caret-left text-xl"></i></button>
            <span className="font-mono text-sm font-bold text-retro-amber">{t('card.nav')}</span>
            <button onClick={onNext} className="hover:text-retro-amber transition-colors"><i className="fa-solid fa-caret-right text-xl"></i></button>
         </div>
         <div className="font-mono text-sm">
            {t('card.execution')}: <span className={`${district.execution_pct < 50 ? 'text-retro-orange' : 'text-retro-amber'} font-bold`}>{district.execution_pct.toFixed(1)}%</span>
         </div>
      </div>

      {/* Content - Responsive Grid */}
      <div className="overflow-y-auto p-4 flex-1 bg-retro-paper">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
            
            {/* COLUMN 1: Budget Data */}
            <div className="mb-6 md:mb-0">
                {/* Total Summary Block */}
                <div className="border-2 border-black p-4 mb-4 shadow-retro-sm bg-white">
                <div className="flex justify-between text-xs font-bold font-mono mb-2 border-b-2 border-black pb-1 text-retro-orange">
                    <span>{t('card.total_budget')}</span>
                    <span>{t('card.spent')}</span>
                </div>
                <div className="flex justify-between items-baseline mb-3 font-mono">
                    <span className="text-lg font-bold text-black">{formatCurrency(district.total_pim)}</span>
                    <span className="text-lg font-bold text-gray-600">{formatCurrency(district.total_devengado)}</span>
                </div>
                
                {/* Retro Progress Bar */}
                <div className="w-full h-6 border-2 border-black p-0.5 bg-gray-200">
                    <div 
                    className={`h-full ${district.execution_pct < 50 ? 'bg-retro-orange' : 'bg-retro-amber'} pattern-diagonal-lines border-r-2 border-black`} 
                    style={{ width: `${Math.min(district.execution_pct, 100)}%` }}
                    ></div>
                </div>
                </div>

                <div>
                    <h3 className="text-sm font-serif font-bold text-black uppercase border-b-4 border-black mb-4 inline-block pr-4 bg-retro-amber px-2">
                        {t('card.breakdown')}
                    </h3>

                    <div className="space-y-3 font-mono text-sm pb-8">
                        {categories.map((cat) => (
                            <div key={cat.name} className="relative">
                                <div className="flex justify-between items-end mb-1 z-10 relative">
                                    <p className="font-bold text-retro-orange pr-4 leading-tight text-xs">{t(`category.${cat.name}`)}</p>
                                    <span className="font-bold text-black bg-white border border-black px-1 text-xs">
                                        {cat.pct.toFixed(0)}%
                                    </span>
                                </div>
                                {/* Retro Bar */}
                                <div className="w-full h-3 border border-black bg-white">
                                    <div 
                                        className={`h-full border-r border-black ${cat.pct < 50 ? 'bg-retro-orange' : 'bg-retro-amber'}`} 
                                        style={{ width: `${Math.min(cat.pct, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-4 p-2 border-l-2 border-black bg-gray-50 text-[10px] text-gray-600 font-mono italic">
                        <i className="fa-solid fa-building-columns mr-1"></i> {t('app.gov_disclaimer')}
                    </div>
                </div>
            </div>

            {/* COLUMN 2: Neighbor Reports (Appears below on mobile, right on desktop) */}
            <div className="md:border-l-4 md:border-black md:pl-8 md:border-dashed">
                <h3 className="text-sm font-serif font-bold text-black uppercase border-b-4 border-black mb-4 inline-block pr-4 bg-retro-orange text-white px-2">
                    {t('card.neighbor_reports')}
                </h3>
                
                {districtReports.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 border border-gray-300">{reports.filter(r => r.district === district.district).length} {t('card.total_reports')}</span>
                        </div>

                        <div className="space-y-2">
                             {districtReports.map((report) => (
                                 <div 
                                     key={report.id} 
                                     onClick={() => onReportSelect?.(Number(report.id))}
                                     className="bg-white border-2 border-black p-2 shadow-retro-sm flex items-start gap-3 cursor-pointer hover:bg-retro-paper transition-colors group"
                                 >
                                     <div className={`w-10 h-10 flex items-center justify-center shrink-0 border border-black group-hover:scale-105 transition-transform ${report.status === 'verified' ? 'bg-retro-amber text-black' : 'bg-gray-100 text-gray-400'}`}>
                                         <i className={`fa-solid ${report.icon} text-lg`}></i>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-bold uppercase truncate text-black group-hover:text-retro-orange transition-colors">{t(`problem.${report.analysis.problem_type}`)}</p>
                                            <span className="text-[9px] font-mono text-white bg-black px-1 ml-2 shrink-0">{t('time.hrs_ago').replace('{n}', report.hoursAgo.toString())}</span>
                                         </div>
                                         <div className="w-full bg-gray-200 h-1 mb-1"></div>
                                         <p className="text-[10px] text-gray-600 line-clamp-2 italic font-mono leading-tight">
                                             "{t('app.mock_desc_pattern')
                                                .replace('{problem}', t(`problem.${report.analysis.problem_type}`).toLowerCase())
                                                .replace('{district}', report.district)}"
                                         </p>
                                     </div>
                                 </div>
                             ))}
                        </div>
                        
                        <div className="text-[10px] font-mono text-gray-500 italic mt-4 bg-gray-100 p-2 border border-gray-300">
                            {t('card.mock_data')}
                        </div>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-400 p-8 text-center bg-gray-50">
                        <i className="fa-solid fa-clipboard-check text-4xl text-gray-300 mb-2"></i>
                        <p className="text-xs font-bold text-gray-400 uppercase">{t('card.no_reports')}</p>
                        <p className="text-[10px] text-gray-400">{t('card.first_report')}</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};