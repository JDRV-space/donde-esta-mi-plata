import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CitizenReport } from '../types';
import { useTranslation } from '../LanguageContext';

interface ReportDetailProps {
  report: CitizenReport;
  onClose: () => void;
}

const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/attribution/">CARTO</a>';

const ReportLocationMap: React.FC<{ latitude: number; longitude: number }> = ({
  latitude,
  longitude,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      attributionControl: true,
    }).setView([latitude, longitude], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: MAP_ATTRIBUTION,
    }).addTo(map);
    L.circleMarker([latitude, longitude], {
      radius: 8,
      color: '#000',
      fillColor: '#FFBF00',
      fillOpacity: 1,
      weight: 2,
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return <div ref={containerRef} className="h-full w-full bg-gray-300 grayscale" />;
};

export const ReportDetailView: React.FC<ReportDetailProps> = ({ report, onClose }) => {
  const { t } = useTranslation();
  const latitude = report.lat ?? -12.0464;
  const longitude = report.lng ?? -77.0428;

  return (
    <div className="fixed inset-0 z-[6000] bg-black/80 flex flex-col justify-center items-center backdrop-blur-sm p-4">
      <div className="bg-retro-paper w-full max-w-lg border-4 border-black shadow-[8px_8px_0_0_#D94F00] flex flex-col overflow-hidden h-[85vh]">
        <div className="p-3 flex justify-between items-center border-b-4 border-black bg-retro-dark text-white">
          <h2 className="text-lg font-mono font-bold uppercase text-retro-amber">
            {t('detail.sample_prefix')} {report.id.toString().padStart(4, '0')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-retro-orange border-2 border-white flex items-center justify-center text-white hover:bg-white hover:text-retro-orange"
            aria-label="Close"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0 font-mono">
          <div className="h-52 border-b-4 border-black bg-gray-200 flex flex-col items-center justify-center p-6 text-center">
            <i className="fa-solid fa-image text-4xl text-gray-400 mb-3"></i>
            <p className="text-sm font-bold uppercase">{t('detail.sample_visual')}</p>
            <p className="text-xs text-gray-500 mt-2">{t('card.sample_data')}</p>
          </div>

          <div className="p-6 space-y-6">
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
                {t('app.sample_desc_pattern')
                  .replace('{problem}', t(`problem.${report.analysis.problem_type}`).toLowerCase())
                  .replace('{district}', report.district)}
              </p>
            </div>

            <div className="h-40 border-2 border-black relative">
              <ReportLocationMap latitude={latitude} longitude={longitude} />
              <div className="absolute bottom-1 right-1 bg-white border border-black px-1 text-[10px] z-[1000]">
                {t('detail.lat')}: {latitude} {t('detail.lng')}: {longitude}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
