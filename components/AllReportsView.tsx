import React, { useState, useEffect } from 'react';
import { ReportDetailView } from './ReportDetailView';
import { MOCK_REPORTS } from '../constants';
import { useTranslation } from '../LanguageContext';

interface AllReportsViewProps {
  onBack: () => void;
  openedReportId?: number;
}

export const AllReportsView: React.FC<AllReportsViewProps> = ({ onBack, openedReportId }) => {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (openedReportId) {
        const report = reports.find(r => r.id === openedReportId.toString());
        if (report) setSelectedReport(report);
    }
  }, [openedReportId, reports]);

  const toggleStatus = (id: number) => {
    setReports(reports.map(r => 
      r.id === id.toString() 
        ? { ...r, status: r.status === 'pending' ? 'verified' : 'pending' }
        : r
    ));
    if (selectedReport && selectedReport.id === id.toString()) {
        setSelectedReport((prev: any) => ({ ...prev, status: prev.status === 'pending' ? 'verified' : 'pending' }));
    }
  };

  const totalReports = reports.length;
  const answeredReports = reports.filter(r => r.status === 'verified').length;

  return (
    <div className="flex flex-col h-full bg-retro-paper p-4 overflow-y-auto font-mono">
      
      {selectedReport && (
        <ReportDetailView 
            report={selectedReport} 
            onClose={() => setSelectedReport(null)}
            onToggleStatus={toggleStatus}
        />
      )}

      {/* Header */}
      <div className="flex items-center mb-6 border-b-4 border-black pb-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white border-2 border-black shadow-retro-sm text-black flex items-center justify-center mr-4 hover:bg-retro-orange hover:text-white transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-2xl font-serif font-black text-black uppercase">{t('db.title')}</h2>
          <span className="text-xs text-black font-bold bg-retro-amber px-1 border border-black">{t('db.version')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-retro-dark text-white p-4 border-2 border-retro-orange shadow-retro">
            <p className="text-xs text-retro-orange font-bold uppercase mb-1">{t('db.total_logs')}</p>
            <p className="text-3xl font-serif text-white">{totalReports}</p>
        </div>
        <div className="bg-white p-4 border-2 border-black shadow-retro">
            <p className="text-xs text-retro-orange font-bold uppercase mb-1">{t('db.attended')}</p>
            <p className="text-3xl font-serif text-black">{answeredReports}</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3 pb-20">
        {reports.map((report) => (
          <div 
            key={report.id} 
            onClick={() => setSelectedReport(report)}
            className="bg-white p-3 border-2 border-black shadow-retro-sm flex items-center gap-4 cursor-pointer hover:bg-yellow-50 transition-colors group"
          >
            <div className={`w-4 h-12 border border-black ${report.status === 'verified' ? 'bg-retro-amber' : 'bg-gray-300'}`}></div>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                    <span className="text-retro-orange bg-retro-paper px-1 border border-gray-200">{report.district}</span>
                    <span className="text-gray-500">{t('time.hrs_ago').replace('{n}', report.hoursAgo.toString())}</span>
                </div>
                <h4 className="text-sm font-bold text-black uppercase mb-1 group-hover:text-retro-orange transition-colors">{t(`problem.${report.analysis.problem_type}`)}</h4>
                <p className="text-xs text-gray-600 truncate font-sans italic">
                    "{t('app.mock_desc_pattern')
                        .replace('{problem}', t(`problem.${report.analysis.problem_type}`).toLowerCase())
                        .replace('{district}', report.district)}"
                </p>
            </div>
            
            <div className="w-8 h-8 flex items-center justify-center border border-black bg-gray-100 group-hover:bg-retro-orange group-hover:text-white group-hover:border-transparent">
                 <i className="fa-solid fa-caret-right"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};