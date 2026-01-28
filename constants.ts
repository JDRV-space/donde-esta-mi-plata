import { BudgetRecord, CitizenReport } from "./types";

// Raw data provided in the prompt context
export const RAW_BUDGET_DATA: BudgetRecord[] = [
  { "district": "ATE", "year": 2025, "category": "EDUCACION", "pia": 3879.0, "pim": 3879.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.0263, "longitude": -76.9186 },
  { "district": "COMAS", "year": 2025, "category": "COMERCIO", "pia": 235000.0, "pim": 235000.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -11.9458, "longitude": -77.0586 },
  { "district": "LA MOLINA", "year": 2025, "category": "DEUDA PUBLICA", "pia": 1250222.0, "pim": 1250222.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.0867, "longitude": -76.9353 },
  { "district": "LINCE", "year": 2025, "category": "SANEAMIENTO", "pia": 4811.0, "pim": 4811.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.0833, "longitude": -77.0333 },
  { "district": "LOS OLIVOS", "year": 2025, "category": "PREVISION SOCIAL", "pia": 6536.0, "pim": 6536.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -11.95, "longitude": -77.0667 },
  { "district": "PACHACAMAC", "year": 2025, "category": "AGROPECUARIA", "pia": 43045.0, "pim": 43045.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.25, "longitude": -76.8667 },
  { "district": "PACHACAMAC", "year": 2025, "category": "SANEAMIENTO", "pia": 41000.0, "pim": 41000.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.25, "longitude": -76.8667 },
  { "district": "PUNTA HERMOSA", "year": 2025, "category": "EDUCACION", "pia": 385000.0, "pim": 385000.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.3333, "longitude": -76.8167 },
  { "district": "SAN BARTOLO", "year": 2025, "category": "SANEAMIENTO", "pia": 24329.0, "pim": 24329.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.4, "longitude": -76.7833 },
  { "district": "SAN BARTOLO", "year": 2025, "category": "CULTURA Y DEPORTE", "pia": 84000.0, "pim": 84000.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.4, "longitude": -76.7833 },
  { "district": "SANTA ANITA", "year": 2025, "category": "PREVISION SOCIAL", "pia": 1089.0, "pim": 1089.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.05, "longitude": -76.9667 },
  { "district": "SANTA MARIA DEL MAR", "year": 2025, "category": "SANEAMIENTO", "pia": 1431.0, "pim": 1431.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.4167, "longitude": -76.7833 },
  { "district": "VILLA MARIA DEL TRIUNFO", "year": 2025, "category": "EDUCACION", "pia": 517824.0, "pim": 517824.0, "devengado": 0.0, "avance_pct": 0.0, "latitude": -12.1667, "longitude": -76.95 },
  { "district": "SAN MARTIN DE PORRES", "year": 2025, "category": "SANEAMIENTO", "pia": 599221.0, "pim": 599221.0, "devengado": 9800.0, "avance_pct": 1.6, "latitude": -12.0167, "longitude": -77.05 },
  { "district": "COMAS", "year": 2025, "category": "AGROPECUARIA", "pia": 101405.0, "pim": 101405.0, "devengado": 6922.0, "avance_pct": 6.8, "latitude": -11.9458, "longitude": -77.0586 },
  { "district": "PACHACAMAC", "year": 2025, "category": "TRABAJO", "pia": 431596.0, "pim": 431596.0, "devengado": 75981.48, "avance_pct": 17.6, "latitude": -12.25, "longitude": -76.8667 },
  { "district": "PUNTA HERMOSA", "year": 2025, "category": "TRANSPORTE", "pia": 7676149.0, "pim": 7676149.0, "devengado": 1836322.1, "avance_pct": 23.9, "latitude": -12.3333, "longitude": -76.8167 },
  { "district": "PUCUSANA", "year": 2025, "category": "CULTURA Y DEPORTE", "pia": 1621902.0, "pim": 1621902.0, "devengado": 431369.66, "avance_pct": 26.6, "latitude": -12.4833, "longitude": -76.8 },
  { "district": "ANCON", "year": 2025, "category": "TRANSPORTE", "pia": 1726419.0, "pim": 1726419.0, "devengado": 525592.22, "avance_pct": 30.4, "latitude": -11.7667, "longitude": -77.15 },
  { "district": "SANTA MARIA DEL MAR", "year": 2025, "category": "SALUD", "pia": 7612.0, "pim": 7612.0, "devengado": 2460.0, "avance_pct": 32.3, "latitude": -12.4167, "longitude": -76.7833 },
  { "district": "SURQUILLO", "year": 2025, "category": "CULTURA Y DEPORTE", "pia": 302086.0, "pim": 302086.0, "devengado": 99503.76, "avance_pct": 32.9, "latitude": -12.1167, "longitude": -77.0167 },
  { "district": "PUEBLO LIBRE", "year": 2025, "category": "TRANSPORTE", "pia": 2653591.0, "pim": 2653591.0, "devengado": 981203.93, "avance_pct": 37.0, "latitude": -12.0833, "longitude": -77.0667 },
  { "district": "ANCON", "year": 2025, "category": "EDUCACION", "pia": 1337437.0, "pim": 1337437.0, "devengado": 522620.72, "avance_pct": 39.1, "latitude": -11.7667, "longitude": -77.15 },
  { "district": "PACHACAMAC", "year": 2025, "category": "TRANSPORTE", "pia": 10130942.0, "pim": 10130942.0, "devengado": 4073661.52, "avance_pct": 40.2, "latitude": -12.25, "longitude": -76.8667 },
  { "district": "SAN JUAN DE MIRAFLORES", "year": 2025, "category": "AGROPECUARIA", "pia": 727137.0, "pim": 727137.0, "devengado": 293800.0, "avance_pct": 40.4, "latitude": -12.15, "longitude": -76.9667 },
  { "district": "SAN ISIDRO", "year": 2025, "category": "SANEAMIENTO", "pia": 265000.0, "pim": 265000.0, "devengado": 108967.0, "avance_pct": 41.1, "latitude": -12.0978, "longitude": -77.0367 },
  { "district": "SURQUILLO", "year": 2025, "category": "SALUD", "pia": 889217.0, "pim": 889217.0, "devengado": 370208.41, "avance_pct": 41.6, "latitude": -12.1167, "longitude": -77.0167 },
  { "district": "EL AGUSTINO", "year": 2025, "category": "TRANSPORTE", "pia": 22496914.0, "pim": 22496914.0, "devengado": 9614683.77, "avance_pct": 42.7, "latitude": -12.05, "longitude": -77.0 },
  { "district": "SAN LUIS", "year": 2025, "category": "TRANSPORTE", "pia": 1715856.0, "pim": 1715856.0, "devengado": 735793.26, "avance_pct": 42.9, "latitude": -12.0667, "longitude": -77.0 },
  { "district": "BARRANCO", "year": 2025, "category": "TURISMO", "pia": 4920446.0, "pim": 4920446.0, "devengado": 2127927.68, "avance_pct": 43.2, "latitude": -12.15, "longitude": -77.0167 },
  { "district": "SANTA ANITA", "year": 2025, "category": "VIVIENDA Y DESARROLLO URBANO", "pia": 8525763.0, "pim": 8525763.0, "devengado": 3726391.76, "avance_pct": 43.7, "latitude": -12.05, "longitude": -76.9667 },
  { "district": "LA MOLINA", "year": 2025, "category": "TURISMO", "pia": 85674.0, "pim": 85674.0, "devengado": 37988.0, "avance_pct": 44.3, "latitude": -12.0867, "longitude": -76.9353 },
  { "district": "EL AGUSTINO", "year": 2025, "category": "CULTURA Y DEPORTE", "pia": 2668528.0, "pim": 2668528.0, "devengado": 1206639.08, "avance_pct": 45.2, "latitude": -12.05, "longitude": -77.0 },
  { "district": "CIENEGUILLA", "year": 2025, "category": "TRANSPORTE", "pia": 20997572.0, "pim": 20997572.0, "devengado": 9512317.6, "avance_pct": 45.3, "latitude": -12.1, "longitude": -76.8167 },
  { "district": "VILLA EL SALVADOR", "year": 2025, "category": "TRANSPORTE", "pia": 45654575.0, "pim": 45654575.0, "devengado": 21091449.34, "avance_pct": 46.2, "latitude": -12.2, "longitude": -76.9333 },
  { "district": "CIENEGUILLA", "year": 2025, "category": "SALUD", "pia": 234627.0, "pim": 234627.0, "devengado": 109090.0, "avance_pct": 46.5, "latitude": -12.1, "longitude": -76.8167 },
  { "district": "SANTA MARIA DEL MAR", "year": 2025, "category": "TRANSPORTE", "pia": 580403.0, "pim": 580403.0, "devengado": 271012.83, "avance_pct": 46.7, "latitude": -12.4167, "longitude": -76.7833 },
  { "district": "RIMAC", "year": 2025, "category": "TRANSPORTE", "pia": 15086864.0, "pim": 15086864.0, "devengado": 7142352.54, "avance_pct": 47.3, "latitude": -12.0333, "longitude": -77.0333 },
  { "district": "SANTA MARIA DEL MAR", "year": 2025, "category": "PROTECCION SOCIAL", "pia": 408912.0, "pim": 408912.0, "devengado": 199969.1, "avance_pct": 48.9, "latitude": -12.4167, "longitude": -76.7833 },
  { "district": "SAN ISIDRO", "year": 2025, "category": "AGROPECUARIA", "pia": 79500.0, "pim": 79500.0, "devengado": 39608.5, "avance_pct": 49.8, "latitude": -12.0978, "longitude": -77.0367 },
  { "district": "CHACLACAYO", "year": 2025, "category": "TURISMO", "pia": 90348.0, "pim": 90348.0, "devengado": 45645.13, "avance_pct": 50.5, "latitude": -11.9833, "longitude": -76.7667 },
  { "district": "SAN MARTIN DE PORRES", "year": 2025, "category": "TRANSPORTE", "pia": 15120231.0, "pim": 15120231.0, "devengado": 7634274.76, "avance_pct": 50.5, "latitude": -12.0167, "longitude": -77.05 },
  { "district": "SANTA ROSA", "year": 2025, "category": "TRANSPORTE", "pia": 8196531.0, "pim": 8196531.0, "devengado": 4141998.89, "avance_pct": 50.5, "latitude": -11.8, "longitude": -77.1667 },
  { "district": "CHACLACAYO", "year": 2025, "category": "SALUD", "pia": 482935.0, "pim": 482935.0, "devengado": 254739.43, "avance_pct": 52.7, "latitude": -11.9833, "longitude": -76.7667 },
  { "district": "SANTIAGO DE SURCO", "year": 2025, "category": "SALUD", "pia": 2302997.0, "pim": 2302997.0, "devengado": 1214910.33, "avance_pct": 52.8, "latitude": -12.1333, "longitude": -77.0 },
  { "district": "ATE", "year": 2025, "category": "VIVIENDA Y DESARROLLO URBANO", "pia": 29560104.0, "pim": 29560104.0, "devengado": 15823204.79, "avance_pct": 53.5, "latitude": -12.0263, "longitude": -76.9186 },
  { "district": "SAN BARTOLO", "year": 2025, "category": "SALUD", "pia": 41610.0, "pim": 41610.0, "devengado": 22380.0, "avance_pct": 53.8, "latitude": -12.4, "longitude": -76.7833 },
  { "district": "LA MOLINA", "year": 2025, "category": "SALUD", "pia": 515985.0, "pim": 515985.0, "devengado": 279256.08, "avance_pct": 54.1, "latitude": -12.0867, "longitude": -76.9353 },
  { "district": "ATE", "year": 2025, "category": "TRANSPORTE", "pia": 49716405.0, "pim": 49716405.0, "devengado": 27202867.5, "avance_pct": 54.7, "latitude": -12.0263, "longitude": -76.9186 },
  { "district": "PACHACAMAC", "year": 2025, "category": "SALUD", "pia": 1003920.0, "pim": 1003920.0, "devengado": 549612.0, "avance_pct": 54.7, "latitude": -12.25, "longitude": -76.8667 },
  { "district": "COMAS", "year": 2025, "category": "TRANSPORTE", "pia": 12648819.0, "pim": 12648819.0, "devengado": 7246755.27, "avance_pct": 57.3, "latitude": -11.9458, "longitude": -77.0586 },
  { "district": "SAN JUAN DE MIRAFLORES", "year": 2025, "category": "TRABAJO", "pia": 1786012.0, "pim": 1786012.0, "devengado": 1036529.87, "avance_pct": 58.0, "latitude": -12.15, "longitude": -76.9667 },
  { "district": "LIMA", "year": 2025, "category": "SALUD", "pia": 3197455.0, "pim": 3197455.0, "devengado": 1861170.45, "avance_pct": 58.2, "latitude": -12.0464, "longitude": -77.0428 },
  { "district": "CIENEGUILLA", "year": 2025, "category": "PROTECCION SOCIAL", "pia": 4439080.0, "pim": 4439080.0, "devengado": 2589280.67, "avance_pct": 58.3, "latitude": -12.1, "longitude": -76.8167 },
  { "district": "PUNTA NEGRA", "year": 2025, "category": "SALUD", "pia": 263700.0, "pim": 263700.0, "devengado": 155833.29, "avance_pct": 59.1, "latitude": -12.3667, "longitude": -76.8 },
  { "district": "LOS OLIVOS", "year": 2025, "category": "TRANSPORTE", "pia": 10818640.0, "pim": 10818640.0, "devengado": 6415401.16, "avance_pct": 59.3, "latitude": -11.95, "longitude": -77.0667 },
  { "district": "SAN MIGUEL", "year": 2025, "category": "TRANSPORTE", "pia": 2454644.0, "pim": 2454644.0, "devengado": 1465556.42, "avance_pct": 59.7, "latitude": -12.0833, "longitude": -77.0833 },
  { "district": "ANCON", "year": 2025, "category": "CULTURA Y DEPORTE", "pia": 1000522.0, "pim": 1000522.0, "devengado": 613570.49, "avance_pct": 61.3, "latitude": -11.7667, "longitude": -77.15 },
  { "district": "ATE", "year": 2025, "category": "PROTECCION SOCIAL", "pia": 27232855.0, "pim": 27232855.0, "devengado": 16801163.79, "avance_pct": 61.7, "latitude": -12.0263, "longitude": -76.9186 },
  { "district": "LIMA", "year": 2025, "category": "AGROPECUARIA", "pia": 709390.0, "pim": 709390.0, "devengado": 438728.27, "avance_pct": 61.8, "latitude": -12.0464, "longitude": -77.0428 },
  { "district": "CARABAYLLO", "year": 2025, "category": "TRANSPORTE", "pia": 22551554.0, "pim": 22551554.0, "devengado": 14045192.79, "avance_pct": 62.3, "latitude": -11.8549, "longitude": -77.0342 },
  { "district": "SAN LUIS", "year": 2025, "category": "CULTURA Y DEPORTE", "pia": 1432309.0, "pim": 1432309.0, "devengado": 893263.38, "avance_pct": 62.4, "latitude": -12.0667, "longitude": -77.0 },
  { "district": "SANTA ROSA", "year": 2025, "category": "CULTURA Y DEPORTE", "pia": 1614408.0, "pim": 1614408.0, "devengado": 1009785.07, "avance_pct": 62.5, "latitude": -11.8, "longitude": -77.1667 },
  { "district": "CARABAYLLO", "year": 2025, "category": "PREVISION SOCIAL", "pia": 279400.0, "pim": 279400.0, "devengado": 175174.88, "avance_pct": 62.7, "latitude": -11.8549, "longitude": -77.0342 },
  { "district": "LA VICTORIA", "year": 2025, "category": "TRANSPORTE", "pia": 13529988.0, "pim": 13529988.0, "devengado": 8482266.75, "avance_pct": 62.7, "latitude": -12.0728, "longitude": -77.0089 },
  { "district": "CIENEGUILLA", "year": 2025, "category": "AGROPECUARIA", "pia": 462303.0, "pim": 462303.0, "devengado": 292670.26, "avance_pct": 63.3, "latitude": -12.1, "longitude": -76.8167 }
];

// Helper to generate a random coordinate near a center point
const randomCoord = (center: number, spread: number = 0.01) => {
  return center + (Math.random() - 0.5) * spread;
};

// Procedurally generate reports for ALL districts
const generateMockReports = (): CitizenReport[] => {
  // Full list of Lima Districts
  const DISTRICTS = [
    'ATE', 'BARRANCO', 'BRENA', 'CARABAYLLO', 'CHACLACAYO', 'CHORRILLOS', 'CIENEGUILLA', 'COMAS', 'EL AGUSTINO', 'INDEPENDENCIA', 
    'JESUS MARIA', 'LA MOLINA', 'LA VICTORIA', 'LIMA', 'LINCE', 'LOS OLIVOS', 'LURIGANCHO', 'LURIN', 'MAGDALENA DEL MAR', 
    'MIRAFLORES', 'PACHACAMAC', 'PUCUSANA', 'PUEBLO LIBRE', 'PUENTE PIEDRA', 'PUNTA HERMOSA', 'PUNTA NEGRA', 'RIMAC', 
    'SAN BARTOLO', 'SAN BORJA', 'SAN ISIDRO', 'SAN JUAN DE LURIGANCHO', 'SAN JUAN DE MIRAFLORES', 'SAN LUIS', 'SAN MARTIN DE PORRES', 
    'SAN MIGUEL', 'SANTA ANITA', 'SANTA MARIA DEL MAR', 'SANTA ROSA', 'SANTIAGO DE SURCO', 'SURQUILLO', 'VILLA EL SALVADOR', 'VILLA MARIA DEL TRIUNFO',
    'ANCON'
  ];

  const PROBLEM_TYPES = [
    { type: 'HUECO EN PISTA', icon: 'fa-road', probType: 'road_damage' },
    { type: 'BASURA ACUMULADA', icon: 'fa-trash', probType: 'trash' },
    { type: 'SIN ALUMBRADO', icon: 'fa-lightbulb', probType: 'lighting' },
    { type: 'VEREDA ROTA', icon: 'fa-person-falling', probType: 'road_damage' },
    { type: 'TUBERIA ROTA', icon: 'fa-water', probType: 'water' },
    { type: 'PARQUE DESCUIDADO', icon: 'fa-tree', probType: 'parks' },
    { type: 'SEMÁFORO ROTO', icon: 'fa-traffic-light', probType: 'lighting' }
  ];

  let reports: CitizenReport[] = [];
  let idCounter = 1;

  DISTRICTS.forEach(district => {
    // Find district coordinates from RAW_BUDGET_DATA if available, else generic fallback
    const districtData = RAW_BUDGET_DATA.find(d => d.district === district);
    const lat = districtData?.latitude || -12.0464;
    const lng = districtData?.longitude || -77.0428;

    // Generate 5-10 reports per district
    const count = Math.floor(Math.random() * 6) + 5; 

    for (let i = 0; i < count; i++) {
        const problem = PROBLEM_TYPES[Math.floor(Math.random() * PROBLEM_TYPES.length)];
        const isVerified = Math.random() > 0.5;
        const hoursAgo = Math.floor(Math.random() * 23) + 1;
        
        reports.push({
            id: idCounter.toString(),
            trackingId: `R-${idCounter.toString().padStart(3, '0')}`,
            district: district,
            type: problem.type,
            hoursAgo: hoursAgo,
            status: isVerified ? 'verified' : 'pending',
            icon: problem.icon,
            desc: `Reporte simulado de ${problem.type.toLowerCase()} en ${district}.`,
            lat: randomCoord(lat),
            lng: randomCoord(lng),
            timestamp: new Date(),
            imageUrl: '',
            analysis: { 
                is_relevant: true,
                problem_type: problem.probType as any, 
                severity: Math.floor(Math.random() * 5) + 1, 
                description: '', 
                estimated_repair_cost_soles: Math.floor(Math.random() * 5000), 
                safety_hazard: Math.random() > 0.7 
            },
            location: { lat: randomCoord(lat), lng: randomCoord(lng) }
        });
        idCounter++;
    }
  });

  return reports;
};

export const MOCK_REPORTS: CitizenReport[] = generateMockReports();