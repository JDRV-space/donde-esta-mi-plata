import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, Pane } from 'react-leaflet';
import L from 'leaflet';
import { AggregatedDistrictData } from '../types';
import { DISTRICT_COORDS } from '../utils/dataProcessing';
import { useTranslation } from '../LanguageContext';

interface MapViewProps {
  districts: AggregatedDistrictData[];
  reports: any[];
  selectedDistrict: AggregatedDistrictData | null;
  onDistrictSelect: (district: AggregatedDistrictData | null) => void;
  onReportSelect: (reportId: number) => void;
  initialCenter?: { lat: number, lng: number };
}

const LimaCenter = { lat: -12.0464, lng: -77.0428 };

// Normalize helper for consistent matching
const normalizeText = (text: string) => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toUpperCase()
    .trim();
};

const getColor = (pct: number) => {
  if (pct < 50) return '#D94F00'; // Retro Orange (Low/Critical)
  if (pct < 80) return '#EAB308'; // Yellow/Gold (Medium)
  if (pct >= 80) return '#FFBF00'; // Retro Amber (High Performance)
  return '#333';
};

// Ray-casting algorithm to check if a point is inside a polygon
const isPointInPolygon = (point: [number, number], vs: [number, number][]) => {
    // point = [lng, lat], vs = [[lng, lat], ...]
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

function MapClickHandler({ onClick }: { onClick: () => void }) {
  useMapEvents({
    click: (e) => {
        // Only trigger if clicking the map background (not a feature)
        onClick();
    },
  });
  return null;
}

function MapController({ center, selectedDistrict, geoJsonData }: { center?: {lat: number, lng: number}, selectedDistrict: AggregatedDistrictData | null, geoJsonData: any }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (selectedDistrict && geoJsonData) {
        // Find feature to zoom to
        const feature = geoJsonData.features.find((f: any) => {
            const props = f.properties;
            // Use matched district property if available, otherwise fallback
            const name = normalizeText(props.MATCHED_DISTRICT || props.NOMBDIST || props.nombdist || props.NOMB_DIST || '');
            const target = normalizeText(selectedDistrict.district);
            return name === target;
        });
        
        if (feature) {
            const layer = L.geoJSON(feature);
            const mapSize = map.getSize();
            try {
              map.fitBounds(layer.getBounds(), { 
                  paddingTopLeft: [20, 20],
                  paddingBottomRight: [20, mapSize.y * 0.5], // Offset for bottom card
                  maxZoom: 14,
                  animate: true,
                  duration: 0.8
              });
            } catch (e) {
              map.flyTo([selectedDistrict.latitude, selectedDistrict.longitude], 13);
            }
        } else {
             map.flyTo([selectedDistrict.latitude, selectedDistrict.longitude], 13);
        }
    } else if (center) {
      map.setView([center.lat, center.lng], 12, { animate: true, duration: 0.8 });
    }
  }, [selectedDistrict, center, map, geoJsonData]);

  return null;
}

export const MapView: React.FC<MapViewProps> = ({ districts, reports, selectedDistrict, onDistrictSelect, onReportSelect, initialCenter }) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false); // Default collapsed on mobile
  const { t } = useTranslation();
  
  // Create a lookup map for fast data retrieval by name
  const districtDataMap = useMemo(() => {
    const map = new Map<string, AggregatedDistrictData>();
    districts.forEach(d => {
        map.set(normalizeText(d.district), d);
    });
    return map;
  }, [districts]);

  useEffect(() => {
    const fetchGeoJSON = async () => {
        try {
            const response = await fetch('https://raw.githubusercontent.com/joseluisq/peru-geojson-datasets/master/lima_callao_distritos.geojson');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            // PRE-PROCESSING: Match polygons to districts based on coordinates
            if (data && data.features) {
                data.features.forEach((feature: any) => {
                    // Try to identify which district this polygon belongs to
                    let matchedName = null;

                    // Iterate over our known district coordinates
                    for (const [distName, coords] of Object.entries(DISTRICT_COORDS)) {
                        const point: [number, number] = [coords.lng, coords.lat]; // GeoJSON is [lng, lat]
                        
                        if (feature.geometry.type === 'Polygon') {
                            if (isPointInPolygon(point, feature.geometry.coordinates[0])) {
                                matchedName = distName;
                                break;
                            }
                        } else if (feature.geometry.type === 'MultiPolygon') {
                            // Check all polygons in the multipolygon
                            for (const polygonCoords of feature.geometry.coordinates) {
                                if (isPointInPolygon(point, polygonCoords[0])) {
                                    matchedName = distName;
                                    break;
                                }
                            }
                            if (matchedName) break;
                        }
                    }

                    if (matchedName) {
                        feature.properties.MATCHED_DISTRICT = matchedName;
                    }
                });
            }

            setGeoJsonData(data);
        } catch (error) {
            console.error("Failed to load GeoJSON:", error);
        }
    };
    fetchGeoJSON();
  }, []);

  const getDistrictStyle = (feature: any) => {
    const props = feature.properties;
    // Prefer the geometrically matched name
    const name = normalizeText(props.MATCHED_DISTRICT || props.NOMBDIST || props.nombdist || props.NOMB_DIST || '');
    
    // Find matching data
    const data = districtDataMap.get(name);
    const pct = data ? data.execution_pct : 0;
    
    const isSelected = selectedDistrict && normalizeText(selectedDistrict.district) === name;
    
    return {
        fillColor: getColor(pct),
        weight: isSelected ? 4 : 2,
        opacity: 1,
        color: isSelected ? '#000' : '#444', 
        dashArray: isSelected ? '8, 4' : '',
        fillOpacity: isSelected ? 0.6 : 0.01 // Transparent by default, visible when selected
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const props = feature.properties;
    const name = normalizeText(props.MATCHED_DISTRICT || props.NOMBDIST || props.nombdist || props.NOMB_DIST || '');

    layer.on({
      click: (e: any) => {
        L.DomEvent.stopPropagation(e); // Stop click from hitting map background
        
        const data = districtDataMap.get(name);
        
        if (data) {
             onDistrictSelect(data);
        }
      },
      mouseover: (e: any) => {
        const isSelected = selectedDistrict && normalizeText(selectedDistrict.district) === name;
        if (!isSelected) {
            e.target.setStyle({ weight: 3, fillOpacity: 0.2, color: '#000' });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) e.target.bringToFront();
        }
      },
      mouseout: (e: any) => {
        const isSelected = selectedDistrict && normalizeText(selectedDistrict.district) === name;
        if (!isSelected) {
             e.target.setStyle({ weight: 2, fillOpacity: 0.01, color: '#444' });
        }
      }
    });
  };

  const geoJsonKey = `geo-${districts.length}-${selectedDistrict?.district || 'none'}-${geoJsonData ? 'loaded' : 'loading'}`;

  return (
    <div className="h-full w-full relative z-0 bg-retro-paper border-t-4 border-black">
      {!geoJsonData && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] bg-retro-dark text-retro-amber px-6 py-4 shadow-retro border-2 border-white text-sm font-bold font-mono">
            <i className="fa-solid fa-circle-notch animate-spin mr-2"></i>
            {t('map.loading')}
        </div>
      )}
      
      <MapContainer 
        center={LimaCenter} 
        zoom={11} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController center={initialCenter} selectedDistrict={selectedDistrict} geoJsonData={geoJsonData} />
        <MapClickHandler onClick={() => selectedDistrict && onDistrictSelect(null)} />
        
        <Pane name="polygons" style={{ zIndex: 400 }}>
            {geoJsonData && districts.length > 0 && (
                <GeoJSON 
                    key={geoJsonKey}
                    data={geoJsonData} 
                    style={getDistrictStyle} 
                    onEachFeature={onEachFeature} 
                />
            )}
        </Pane>

      </MapContainer>
      
      {/* Collapsible Legend Card */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col items-start">
        <button 
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="bg-retro-paper border-2 border-black p-2 shadow-retro font-mono text-xs font-bold uppercase flex items-center gap-2 hover:bg-retro-amber transition-colors"
        >
            <i className={`fa-solid ${isLegendOpen ? 'fa-minus' : 'fa-list-ul'}`}></i>
            {isLegendOpen ? t('map.hide') : t('map.legend')}
        </button>

        {isLegendOpen && (
            <div className="mt-2 bg-retro-paper border-2 border-black p-3 shadow-retro text-xs font-mono animate-[fadeIn_0.2s_ease-out]">
                <h4 className="font-bold border-b-2 border-black mb-2 pb-1 uppercase text-black">{t('map.execution')}</h4>
                <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-retro-orange border border-black"></div>
                <span className="font-bold text-retro-orange">&lt;50% {t('map.critical')}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-yellow-500 border border-black"></div>
                <span className="font-bold text-yellow-700">50-80% {t('map.medium')}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-retro-amber border border-black"></div>
                <span className="font-bold text-black bg-retro-amber px-1">&gt;80% {t('map.high')}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 border-t border-gray-400 pt-1">
                {t('map.click_hint')}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};