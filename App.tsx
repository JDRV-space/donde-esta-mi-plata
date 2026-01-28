import React, { useState, useEffect } from 'react';
import { MapView } from './components/MapView';
import { ReportView } from './components/ReportView';
import { ReportFlow } from './components/ReportFlow';
import { Onboarding } from './components/Onboarding';
import { AllReportsView } from './components/AllReportsView';
import { DistrictSummaryCard } from './components/DistrictSummaryCard';
import { ReportDetailView } from './components/ReportDetailView';
import { getAggregatedDistrictData, getAggregatedDistrictDataAsync } from './utils/dataProcessing';
import { AggregatedDistrictData } from './types';
import { MOCK_REPORTS } from './constants';
import { useTranslation } from './LanguageContext';
import { Language } from './translations';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'report' | 'map' | 'all_reports'>('report');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<AggregatedDistrictData | null>(null);
  const [currentDistrict, setCurrentDistrict] = useState<AggregatedDistrictData | null>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [openedReportId, setOpenedReportId] = useState<number | undefined>(undefined);
  
  const [districts, setDistricts] = useState<AggregatedDistrictData[]>(() => getAggregatedDistrictData());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dataSource, setDataSource] = useState<'loading' | 'supabase' | 'fallback'>('loading');

  const { t, language, setLanguage } = useTranslation();

  // Load data
  useEffect(() => {
    let cancelled = false;
    async function loadFromSupabase() {
      try {
        const data = await getAggregatedDistrictDataAsync();
        if (!cancelled && data.length > 0) {
          setDistricts(data);
          setDataSource('supabase');
        }
      } catch (err) {
        if (!cancelled) setDataSource('fallback');
      }
    }
    loadFromSupabase();
    return () => { cancelled = true; };
  }, []);

  // Geolocation for initial center
  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                let closest = districts[0];
                let minDist = Infinity;
                districts.forEach(d => {
                    const dist = Math.sqrt(Math.pow(d.latitude - userLoc.lat, 2) + Math.pow(d.longitude - userLoc.lng, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        closest = d;
                    }
                });
                
                if (minDist < 0.1) {
                    setMapCenter({ lat: closest.latitude, lng: closest.longitude });
                    setCurrentDistrict(closest);
                } else {
                    const miraflores = districts.find(d => d.district === 'MIRAFLORES');
                    if (miraflores) {
                        setMapCenter({ lat: miraflores.latitude, lng: miraflores.longitude });
                        setCurrentDistrict(miraflores);
                    }
                }
            },
            () => {
                const miraflores = districts.find(d => d.district === 'MIRAFLORES');
                if (miraflores) {
                    setMapCenter({ lat: miraflores.latitude, lng: miraflores.longitude });
                    setCurrentDistrict(miraflores);
                }
            }
        );
    }
  }, [districts]);

  const handleOpenReport = (reportId?: number) => {
    setOpenedReportId(reportId);
    if (!reportId) {
        // If closing report, stay on current view unless we were in all_reports
        if (currentView === 'all_reports') {
             // do nothing, let AllReportsView handle back
        }
    } else {
        // If opening specific report from ReportView list, we can switch to map or detail
        // For simplicity, let's keep the view but overlay the detail
    }
  };

  const handleNextDistrict = () => {
    if (!selectedDistrict) return;
    const idx = districts.findIndex(d => d.district === selectedDistrict.district);
    const nextIdx = (idx + 1) % districts.length;
    setSelectedDistrict(districts[nextIdx]);
  };

  const handlePrevDistrict = () => {
    if (!selectedDistrict) return;
    const idx = districts.findIndex(d => d.district === selectedDistrict.district);
    const prevIdx = (idx - 1 + districts.length) % districts.length;
    setSelectedDistrict(districts[prevIdx]);
  };

  // Find the opened report object
  const openedReport = openedReportId ? MOCK_REPORTS.find(r => r.id === openedReportId.toString()) : null;

  return (
    <div className="flex flex-col h-full font-mono text-retro-dark bg-retro-paper">
      {/* Onboarding Overlay */}
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

      {/* Global Report Detail Overlay */}
      {openedReport && (
        <ReportDetailView 
            report={openedReport}
            onClose={() => setOpenedReportId(undefined)}
            onToggleStatus={(id) => {
                // Mock toggle logic would go here or in a global store
            }}
        />
      )}

      {/* Retro Header with Top Navigation */}
      <header className="bg-retro-dark text-retro-amber border-b-4 border-retro-amber p-4 flex flex-col gap-4 shrink-0 relative z-30 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between">
            <h1 className="font-serif font-black text-xl tracking-tighter uppercase drop-shadow-md">
                {t('app.title')}
            </h1>
            <div className="flex items-center gap-2">
                <div className="flex bg-black border border-retro-amber p-0.5 gap-0.5">
                    {(['es', 'en', 'qu'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                                language === lang 
                                ? 'bg-retro-amber text-black' 
                                : 'text-retro-amber hover:bg-gray-800'
                            }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                <div className="bg-retro-amber text-black text-xs font-bold px-2 py-1 uppercase border-2 border-retro-paper shadow-[2px_2px_0_0_#fff]">
                    V.2.0
                </div>
            </div>
        </div>

        {/* Top Navigation Switch */}
        <div className="flex bg-black p-1 border-2 border-retro-gray gap-1">
            <button 
                onClick={() => setCurrentView('report')}
                className={`flex-1 py-2 text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 border-2 ${
                  currentView === 'report' || currentView === 'all_reports'
                    ? 'bg-retro-amber text-black border-white shadow-[2px_2px_0_0_#fff] translate-y-[-2px]' 
                    : 'bg-retro-dark text-gray-500 border-transparent hover:text-retro-amber'
                }`}
            >
                <i className="fa-solid fa-camera"></i> {t('app.report')}
            </button>
            <button 
                onClick={() => setCurrentView('map')}
                className={`flex-1 py-2 text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 border-2 ${
                  currentView === 'map' 
                    ? 'bg-retro-amber text-black border-white shadow-[2px_2px_0_0_#fff] translate-y-[-2px]' 
                    : 'bg-retro-dark text-gray-500 border-transparent hover:text-retro-amber'
                }`}
            >
                <i className="fa-solid fa-map"></i> {t('app.map')}
            </button>
        </div>
      </header>

      {/* Main Screen Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-retro-paper">
        
        {currentView === 'report' && (
            <ReportView 
                onCapture={setReportFile}
                currentDistrict={currentDistrict}
                onViewAllReports={() => setCurrentView('all_reports')}
            />
        )}

        {currentView === 'map' && (
             <div className="flex-1 relative h-full">
                <MapView 
                    districts={districts}
                    reports={MOCK_REPORTS}
                    selectedDistrict={selectedDistrict}
                    onDistrictSelect={setSelectedDistrict}
                    onReportSelect={handleOpenReport}
                    initialCenter={mapCenter}
                />
                
                {selectedDistrict && (
                    <DistrictSummaryCard 
                        district={selectedDistrict} 
                        reports={MOCK_REPORTS}
                        onClose={() => setSelectedDistrict(null)}
                        onNext={handleNextDistrict}
                        onPrev={handlePrevDistrict}
                        onReportSelect={handleOpenReport}
                    />
                )}
            </div>
        )}

        {currentView === 'all_reports' && (
            <AllReportsView 
                onBack={() => setCurrentView('report')}
                openedReportId={openedReportId} // Used to highlight or scroll to report if needed
            />
        )}

        {reportFile && (
            <ReportFlow 
                imageFile={reportFile}
                districts={districts}
                onClose={() => setReportFile(null)}
            />
        )}
      </main>
    </div>
  );
};

export default App;