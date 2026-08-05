import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { AggregatedDistrictData } from '../types';
import { DISTRICT_COORDS } from '../utils/dataProcessing';
import { useTranslation } from '../LanguageContext';

interface MapViewProps {
  districts: AggregatedDistrictData[];
  selectedDistrict: AggregatedDistrictData | null;
  onDistrictSelect: (district: AggregatedDistrictData | null) => void;
}

const LIMA_CENTER: L.LatLngExpression = [-12.0464, -77.0428];
const LIMA_DISTRICT_GEOJSON_URL =
  'https://raw.githubusercontent.com/joseluisq/peru-geojson-datasets/2c2a8ae7dc317767a389a37b6b5ef4d3fc51ec16/lima_callao_distritos.geojson';
const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/attribution/">CARTO</a> | boundaries: <a href="https://github.com/joseluisq/peru-geojson-datasets">peru-geojson-datasets</a>';

const normalizeText = (text: string) => text
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .trim();

const getColor = (percentage: number) => {
  if (percentage < 50) return '#D94F00';
  if (percentage < 80) return '#EAB308';
  return '#FFBF00';
};

const isPointInPolygon = (point: [number, number], vertices: [number, number][]) => {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const [xi, yi] = vertices[i];
    const [xj, yj] = vertices[j];
    const intersects = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersects) inside = !inside;
  }

  return inside;
};

const matchDistrictNames = (geoJsonData: any) => {
  for (const feature of geoJsonData?.features ?? []) {
    for (const [district, coordinates] of Object.entries(DISTRICT_COORDS)) {
      const point: [number, number] = [coordinates.lng, coordinates.lat];
      const polygons = feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;

      if (polygons.some((polygon: [number, number][][]) => isPointInPolygon(point, polygon[0]))) {
        feature.properties.MATCHED_DISTRICT = district;
        break;
      }
    }
  }

  return geoJsonData;
};

const featureDistrictName = (feature: any) => normalizeText(
  feature.properties.MATCHED_DISTRICT
    || feature.properties.NOMBDIST
    || feature.properties.nombdist
    || feature.properties.NOMB_DIST
    || '',
);

export const MapView: React.FC<MapViewProps> = ({
  districts,
  selectedDistrict,
  onDistrictSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const { t } = useTranslation();

  const districtDataMap = useMemo(() => new Map(
    districts.map((district) => [normalizeText(district.district), district]),
  ), [districts]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: false }).setView(LIMA_CENTER, 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: MAP_ATTRIBUTION,
    }).addTo(map);
    map.on('click', () => onDistrictSelect(null));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onDistrictSelect]);

  useEffect(() => {
    const controller = new AbortController();

    const loadBoundaries = async () => {
      try {
        const response = await fetch(LIMA_DISTRICT_GEOJSON_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`Boundary request failed: ${response.status}`);
        setGeoJsonData(matchDistrictNames(await response.json()));
      } catch (error) {
        if (!controller.signal.aborted) console.error('Failed to load district boundaries:', error);
      }
    };

    void loadBoundaries();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoJsonData) return;

    geoJsonLayerRef.current?.remove();
    const selectedName = selectedDistrict ? normalizeText(selectedDistrict.district) : '';

    const layer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const name = feature ? featureDistrictName(feature) : '';
        const data = districtDataMap.get(name);
        const selected = name === selectedName;
        return {
          fillColor: getColor(data?.execution_pct ?? 0),
          weight: selected ? 4 : 2,
          opacity: 1,
          color: selected ? '#000' : '#444',
          dashArray: selected ? '8, 4' : '',
          fillOpacity: selected ? 0.6 : 0.01,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const name = featureDistrictName(feature);
        featureLayer.on('click', (event) => {
          L.DomEvent.stopPropagation(event);
          const district = districtDataMap.get(name);
          if (district) onDistrictSelect(district);
        });
      },
    }).addTo(map);

    geoJsonLayerRef.current = layer;

    if (selectedDistrict) {
      const selectedFeature = geoJsonData.features.find(
        (feature: any) => featureDistrictName(feature) === selectedName,
      );
      if (selectedFeature) {
        map.fitBounds(L.geoJSON(selectedFeature).getBounds(), {
          paddingTopLeft: [20, 20],
          paddingBottomRight: [20, map.getSize().y * 0.5],
          maxZoom: 14,
        });
      } else {
        map.flyTo([selectedDistrict.latitude, selectedDistrict.longitude], 13);
      }
    }

    return () => {
      layer.remove();
    };
  }, [districtDataMap, geoJsonData, onDistrictSelect, selectedDistrict]);

  return (
    <div className="h-full w-full relative z-0 bg-retro-paper border-t-4 border-black">
      {!geoJsonData && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] bg-retro-dark text-retro-amber px-6 py-4 shadow-retro border-2 border-white text-sm font-bold font-mono">
          <i className="fa-solid fa-circle-notch animate-spin mr-2"></i>
          {t('map.loading')}
        </div>
      )}

      <div ref={containerRef} className="h-full w-full" aria-label={t('app.map')} />

      <div className="absolute top-4 left-4 z-[400] flex flex-col items-start">
        <button
          onClick={() => setIsLegendOpen((open) => !open)}
          className="bg-retro-paper border-2 border-black p-2 shadow-retro font-mono text-xs font-bold uppercase flex items-center gap-2 hover:bg-retro-amber transition-colors"
        >
          <i className={`fa-solid ${isLegendOpen ? 'fa-minus' : 'fa-list-ul'}`}></i>
          {isLegendOpen ? t('map.hide') : t('map.legend')}
        </button>

        {isLegendOpen && (
          <div className="mt-2 bg-retro-paper border-2 border-black p-3 shadow-retro text-xs font-mono">
            <h4 className="font-bold border-b-2 border-black mb-2 pb-1 uppercase text-black">{t('map.execution')}</h4>
            <div className="flex items-center gap-2 mb-2"><div className="w-4 h-4 bg-retro-orange border border-black"></div><span className="font-bold text-retro-orange">&lt;50% {t('map.critical')}</span></div>
            <div className="flex items-center gap-2 mb-2"><div className="w-4 h-4 bg-yellow-500 border border-black"></div><span className="font-bold text-yellow-700">50-80% {t('map.medium')}</span></div>
            <div className="flex items-center gap-2 mb-3"><div className="w-4 h-4 bg-retro-amber border border-black"></div><span className="font-bold text-black bg-retro-amber px-1">&gt;80% {t('map.high')}</span></div>
            <p className="text-[10px] text-gray-500 mt-2 border-t border-gray-400 pt-1">{t('map.click_hint')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
