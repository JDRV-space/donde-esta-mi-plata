import { AggregatedDistrictData } from '../types';

// District coordinates for map markers
export const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  'LIMA': { lat: -12.0464, lng: -77.0428 },
  'MIRAFLORES': { lat: -12.1219, lng: -77.0297 },
  'SAN ISIDRO': { lat: -12.0978, lng: -77.0367 },
  'SAN BORJA': { lat: -12.1, lng: -77.0 },
  'SANTIAGO DE SURCO': { lat: -12.1333, lng: -77.0 },
  'LA MOLINA': { lat: -12.0867, lng: -76.9353 },
  'ATE': { lat: -12.0263, lng: -76.9186 },
  'SAN JUAN DE LURIGANCHO': { lat: -11.9833, lng: -77.0 },
  'COMAS': { lat: -11.9458, lng: -77.0586 },
  'VILLA EL SALVADOR': { lat: -12.2, lng: -76.9333 },
  'SAN MARTIN DE PORRES': { lat: -12.0167, lng: -77.05 },
  'LOS OLIVOS': { lat: -11.9667, lng: -77.0667 },
  'INDEPENDENCIA': { lat: -11.9833, lng: -77.05 },
  'CHORRILLOS': { lat: -12.1667, lng: -77.0167 },
  'BARRANCO': { lat: -12.15, lng: -77.0167 },
  'JESUS MARIA': { lat: -12.0833, lng: -77.05 },
  'LINCE': { lat: -12.0833, lng: -77.0333 },
  'PUEBLO LIBRE': { lat: -12.0833, lng: -77.0667 },
  'MAGDALENA DEL MAR': { lat: -12.0833, lng: -77.0667 },
  'SAN MIGUEL': { lat: -12.0833, lng: -77.0833 },
  'SURQUILLO': { lat: -12.1167, lng: -77.0167 },
  'BRENA': { lat: -12.0667, lng: -77.05 },
  'RIMAC': { lat: -12.0333, lng: -77.0333 },
  'LA VICTORIA': { lat: -12.0667, lng: -77.0167 },
  'EL AGUSTINO': { lat: -12.05, lng: -76.9833 },
  'SANTA ANITA': { lat: -12.05, lng: -76.9667 },
  'LURIGANCHO': { lat: -11.9833, lng: -76.9167 },
  'CHACLACAYO': { lat: -11.9833, lng: -76.7667 },
  'CIENEGUILLA': { lat: -12.1, lng: -76.8 },
  'PACHACAMAC': { lat: -12.2167, lng: -76.8667 },
  'LURIN': { lat: -12.2667, lng: -76.8667 },
  'PUNTA HERMOSA': { lat: -12.3333, lng: -76.8167 },
  'PUNTA NEGRA': { lat: -12.3667, lng: -76.8 },
  'SAN BARTOLO': { lat: -12.3833, lng: -76.7833 },
  'SANTA MARIA DEL MAR': { lat: -12.4, lng: -76.7667 },
  'PUCUSANA': { lat: -12.4833, lng: -76.8 },
  'ANCON': { lat: -11.7667, lng: -77.15 },
  'SANTA ROSA': { lat: -11.8, lng: -77.1667 },
  'CARABAYLLO': { lat: -11.85, lng: -77.0333 },
  'PUENTE PIEDRA': { lat: -11.8667, lng: -77.0833 },
  'VILLA MARIA DEL TRIUNFO': { lat: -12.1667, lng: -76.95 },
  'SAN JUAN DE MIRAFLORES': { lat: -12.15, lng: -76.9667 },
  'CALLAO': { lat: -12.0667, lng: -77.15 },
  'BELLAVISTA': { lat: -12.0667, lng: -77.1167 },
  'LA PERLA': { lat: -12.0667, lng: -77.1167 },
  'LA PUNTA': { lat: -12.0667, lng: -77.1667 },
  'VENTANILLA': { lat: -11.8833, lng: -77.1333 },
  'MI PERU': { lat: -11.8667, lng: -77.1167 },
  'CARMEN DE LA LEGUA REYNOSO': { lat: -12.05, lng: -77.1 },
  'SAN LUIS': { lat: -12.0833, lng: -77.0 },
};

// VERIFIED 2025 MUNICIPAL DATA
// Filter logic: Project contains "DISTRITO DE [Name]" + Max S/50M per project + RESIDUOS SOLIDOS
// This excludes national/regional projects that were inflating the budget.
const VERIFIED_2025_DATA: AggregatedDistrictData[] = [
  { district: "LIMA", latitude: -12.0464, longitude: -77.0428, total_pim: 267343149, total_devengado: 196661479, execution_pct: 73.6, categories: {"CULTURA Y DEPORTE":{pim:198142284,devengado:153700404,pct:77.6},"TRANSPORTE":{pim:30341080,devengado:27445133,pct:90.5},"RELACIONES EXTERIORES":{pim:19807161,devengado:6108926,pct:30.8}} },
  { district: "SAN JUAN DE LURIGANCHO", latitude: -11.9833, longitude: -77.0, total_pim: 181454772, total_devengado: 167865494, execution_pct: 92.5, categories: {"EDUCACION":{pim:140022685,devengado:135284961,pct:96.6},"SALUD":{pim:35359818,devengado:29435051,pct:83.2},"TRANSPORTE":{pim:2624965,devengado:300387,pct:11.4}} },
  { district: "VENTANILLA", latitude: -11.8833, longitude: -77.1333, total_pim: 137910435, total_devengado: 85608773, execution_pct: 62.1, categories: {"TRANSPORTE":{pim:63903408,devengado:33863433,pct:53.0},"EDUCACION":{pim:40592459,devengado:27675460,pct:68.2},"AMBIENTE":{pim:23213730,devengado:19933016,pct:85.9}} },
  { district: "VILLA MARIA DEL TRIUNFO", latitude: -12.1667, longitude: -76.95, total_pim: 135558717, total_devengado: 127283704, execution_pct: 93.9, categories: {"EDUCACION":{pim:55618846,devengado:55574484,pct:99.9},"AMBIENTE":{pim:38225614,devengado:34128298,pct:89.3},"TRANSPORTE":{pim:30082849,devengado:25117338,pct:83.5}} },
  { district: "VILLA EL SALVADOR", latitude: -12.2, longitude: -76.9333, total_pim: 117719277, total_devengado: 94695836, execution_pct: 80.4, categories: {"EDUCACION":{pim:49008296,devengado:48928536,pct:99.8},"TRANSPORTE":{pim:28379071,devengado:13476282,pct:47.5},"AMBIENTE":{pim:27973323,devengado:20640873,pct:73.8}} },
  { district: "MIRAFLORES", latitude: -12.1219, longitude: -77.0297, total_pim: 112535609, total_devengado: 78126915, execution_pct: 69.4, categories: {"AMBIENTE":{pim:50625686,devengado:43411314,pct:85.7},"TURISMO":{pim:16205086,devengado:11769881,pct:72.6},"ORDEN PUBLICO Y SEGURIDAD":{pim:15495576,devengado:3122603,pct:20.2}} },
  { district: "PUENTE PIEDRA", latitude: -11.8667, longitude: -77.0833, total_pim: 72553703, total_devengado: 64271541, execution_pct: 88.6, categories: {"AMBIENTE":{pim:38252501,devengado:33412358,pct:87.3},"TRANSPORTE":{pim:14554645,devengado:12554856,pct:86.3},"SALUD":{pim:14081022,devengado:13208972,pct:93.8}} },
  { district: "LA MOLINA", latitude: -12.0867, longitude: -76.9353, total_pim: 72039014, total_devengado: 72039014, execution_pct: 99.9, categories: {"EDUCACION":{pim:46920246,devengado:37542938,pct:80.0},"AMBIENTE":{pim:21441208,devengado:18198317,pct:84.9},"TRANSPORTE":{pim:2935260,devengado:2935260,pct:99.9}} },
  { district: "LA VICTORIA", latitude: -12.0667, longitude: -77.0167, total_pim: 66553329, total_devengado: 48301648, execution_pct: 72.6, categories: {"AMBIENTE":{pim:45682316,devengado:42091227,pct:92.1},"TRANSPORTE":{pim:18527687,devengado:4671167,pct:25.2},"CULTURA Y DEPORTE":{pim:1784787,devengado:1056672,pct:59.2}} },
  { district: "COMAS", latitude: -11.9458, longitude: -77.0586, total_pim: 64093713, total_devengado: 51829174, execution_pct: 80.9, categories: {"AMBIENTE":{pim:42025081,devengado:39913499,pct:95.0},"SALUD":{pim:12398411,devengado:1731671,pct:14.0},"SANEAMIENTO":{pim:4761893,devengado:3141649,pct:66.0}} },
  { district: "CALLAO", latitude: -12.0667, longitude: -77.15, total_pim: 55286028, total_devengado: 42299524, execution_pct: 76.5, categories: {"ORDEN PUBLICO Y SEGURIDAD":{pim:27374822,devengado:21619621,pct:79.0},"TRANSPORTE":{pim:10155779,devengado:6150526,pct:60.6},"EDUCACION":{pim:8903971,devengado:4197989,pct:47.1}} },
  { district: "RIMAC", latitude: -12.0333, longitude: -77.0333, total_pim: 51131424, total_devengado: 38630257, execution_pct: 75.6, categories: {"EDUCACION":{pim:20643943,devengado:16354760,pct:79.2},"AMBIENTE":{pim:18994041,devengado:16052651,pct:84.5},"SANEAMIENTO":{pim:5352035,devengado:1551839,pct:29.0}} },
  { district: "INDEPENDENCIA", latitude: -11.9833, longitude: -77.05, total_pim: 50101674, total_devengado: 41088364, execution_pct: 82.0, categories: {"AMBIENTE":{pim:26189245,devengado:21953866,pct:83.8},"SANEAMIENTO":{pim:8196698,devengado:5966970,pct:72.8},"TRANSPORTE":{pim:7358152,devengado:5755044,pct:78.2}} },
  { district: "SAN MARTIN DE PORRES", latitude: -12.0167, longitude: -77.05, total_pim: 49715675, total_devengado: 42116147, execution_pct: 84.7, categories: {"EDUCACION":{pim:14273580,devengado:13500669,pct:94.6},"VIVIENDA Y DESARROLLO URBANO":{pim:9173172,devengado:7244949,pct:79.0},"TRANSPORTE":{pim:8423982,devengado:3385081,pct:40.2}} },
  { district: "CARABAYLLO", latitude: -11.85, longitude: -77.0333, total_pim: 46304372, total_devengado: 38791021, execution_pct: 83.8, categories: {"AMBIENTE":{pim:32062886,devengado:27988906,pct:87.3},"TRANSPORTE":{pim:10740266,devengado:7725998,pct:71.9},"EDUCACION":{pim:2976610,devengado:2901248,pct:97.5}} },
  { district: "SAN ISIDRO", latitude: -12.0978, longitude: -77.0367, total_pim: 45796539, total_devengado: 36211578, execution_pct: 79.1, categories: {"AMBIENTE":{pim:34412262,devengado:25808852,pct:75.0},"PROTECCION SOCIAL":{pim:4563188,devengado:3357057,pct:73.6},"ORDEN PUBLICO Y SEGURIDAD":{pim:3801609,devengado:3801609,pct:99.9}} },
  { district: "LOS OLIVOS", latitude: -11.9667, longitude: -77.0667, total_pim: 41797298, total_devengado: 36929180, execution_pct: 88.4, categories: {"AMBIENTE":{pim:30693830,devengado:29127433,pct:94.9},"TRANSPORTE":{pim:4210518,devengado:3782069,pct:89.8},"CULTURA Y DEPORTE":{pim:3752612,devengado:1435131,pct:38.2}} },
  { district: "SAN MIGUEL", latitude: -12.0833, longitude: -77.0833, total_pim: 37053037, total_devengado: 32178754, execution_pct: 86.8, categories: {"AMBIENTE":{pim:28666039,devengado:24710026,pct:86.2},"VIVIENDA Y DESARROLLO URBANO":{pim:4082238,devengado:2887649,pct:70.7},"EDUCACION":{pim:1990683,devengado:1958417,pct:98.4}} },
  { district: "CHORRILLOS", latitude: -12.1667, longitude: -77.0167, total_pim: 36313356, total_devengado: 25817643, execution_pct: 71.1, categories: {"AMBIENTE":{pim:27361011,devengado:22668142,pct:82.8},"VIVIENDA Y DESARROLLO URBANO":{pim:4617872,devengado:1517908,pct:32.9},"TRANSPORTE":{pim:2786452,devengado:1007270,pct:36.1}} },
  { district: "SANTA ROSA", latitude: -11.8, longitude: -77.1667, total_pim: 31269919, total_devengado: 19220608, execution_pct: 61.5, categories: {"TRANSPORTE":{pim:8951527,devengado:6218384,pct:69.5},"VIVIENDA Y DESARROLLO URBANO":{pim:5576188,devengado:5493864,pct:98.5},"EDUCACION":{pim:5523102,devengado:612410,pct:11.1}} },
  { district: "BELLAVISTA", latitude: -12.0667, longitude: -77.1167, total_pim: 30157678, total_devengado: 30157678, execution_pct: 99.9, categories: {"AMBIENTE":{pim:15353234,devengado:11419770,pct:74.4},"EDUCACION":{pim:9216290,devengado:6063180,pct:65.8},"ORDEN PUBLICO Y SEGURIDAD":{pim:2442328,devengado:3700,pct:0.2}} },
  { district: "LURIGANCHO", latitude: -11.9833, longitude: -76.9167, total_pim: 30151851, total_devengado: 30151851, execution_pct: 99.9, categories: {"AMBIENTE":{pim:17811094,devengado:16784940,pct:94.2},"TRANSPORTE":{pim:8303668,devengado:8218406,pct:99.0},"VIVIENDA Y DESARROLLO URBANO":{pim:1636153,devengado:1636153,pct:99.9}} },
  { district: "SANTA ANITA", latitude: -12.05, longitude: -76.9667, total_pim: 29225176, total_devengado: 23782962, execution_pct: 81.4, categories: {"AMBIENTE":{pim:21486250,devengado:18232306,pct:84.9},"TRANSPORTE":{pim:7325316,devengado:5500197,pct:75.1},"VIVIENDA Y DESARROLLO URBANO":{pim:405234,devengado:42083,pct:10.4}} },
  { district: "SAN JUAN DE MIRAFLORES", latitude: -12.15, longitude: -76.9667, total_pim: 28499266, total_devengado: 26144327, execution_pct: 91.7, categories: {"AMBIENTE":{pim:28197085,devengado:25478303,pct:90.4},"EDUCACION":{pim:302181,devengado:269025,pct:89.0},"SALUD":{pim:0,devengado:397000,pct:0}} },
  { district: "ANCON", latitude: -11.7667, longitude: -77.15, total_pim: 25844525, total_devengado: 18938508, execution_pct: 73.3, categories: {"AMBIENTE":{pim:14447621,devengado:10777117,pct:74.6},"SANEAMIENTO":{pim:5690344,devengado:4694207,pct:82.5},"VIVIENDA Y DESARROLLO URBANO":{pim:2627577,devengado:2212158,pct:84.2}} },
  { district: "CIENEGUILLA", latitude: -12.1, longitude: -76.8, total_pim: 25799083, total_devengado: 16099662, execution_pct: 62.4, categories: {"TRANSPORTE":{pim:9928140,devengado:1834586,pct:18.5},"CULTURA Y DEPORTE":{pim:7551939,devengado:7128643,pct:94.4},"AMBIENTE":{pim:5833420,devengado:4800889,pct:82.3}} },
  { district: "PACHACAMAC", latitude: -12.2167, longitude: -76.8667, total_pim: 25281866, total_devengado: 19085212, execution_pct: 75.5, categories: {"AMBIENTE":{pim:11706188,devengado:9882006,pct:84.4},"CULTURA Y DEPORTE":{pim:8917556,devengado:8793656,pct:98.6},"TRANSPORTE":{pim:4418122,devengado:313550,pct:7.1}} },
  { district: "PUEBLO LIBRE", latitude: -12.0833, longitude: -77.0667, total_pim: 24334958, total_devengado: 15478052, execution_pct: 63.6, categories: {"AMBIENTE":{pim:12712183,devengado:11471776,pct:90.2},"CULTURA Y DEPORTE":{pim:3707160,devengado:740574,pct:20.0},"SANEAMIENTO":{pim:3072688,devengado:2432959,pct:79.2}} },
  { district: "LINCE", latitude: -12.0833, longitude: -77.0333, total_pim: 24234099, total_devengado: 19122939, execution_pct: 78.9, categories: {"TRANSPORTE":{pim:10807398,devengado:7079220,pct:65.5},"AMBIENTE":{pim:7819030,devengado:7151133,pct:91.5},"VIVIENDA Y DESARROLLO URBANO":{pim:3475349,devengado:3474641,pct:99.9}} },
  { district: "EL AGUSTINO", latitude: -12.05, longitude: -76.9833, total_pim: 22740517, total_devengado: 15922607, execution_pct: 70.0, categories: {"AMBIENTE":{pim:16305858,devengado:15203802,pct:93.2},"TRANSPORTE":{pim:5355480,devengado:396102,pct:7.4},"PROTECCION SOCIAL":{pim:668117,devengado:320923,pct:48.0}} },
  { district: "MAGDALENA DEL MAR", latitude: -12.0833, longitude: -77.0667, total_pim: 22070085, total_devengado: 17036864, execution_pct: 77.2, categories: {"AMBIENTE":{pim:11782934,devengado:9623569,pct:81.7},"TRANSPORTE":{pim:6281017,devengado:4756955,pct:75.7},"ORDEN PUBLICO Y SEGURIDAD":{pim:3515041,devengado:2304299,pct:65.6}} },
  { district: "JESUS MARIA", latitude: -12.0833, longitude: -77.05, total_pim: 21863344, total_devengado: 17678057, execution_pct: 80.9, categories: {"AMBIENTE":{pim:17737580,devengado:14642915,pct:82.6},"ORDEN PUBLICO Y SEGURIDAD":{pim:3661019,devengado:2735600,pct:74.7},"TRABAJO":{pim:324542,devengado:239542,pct:73.8}} },
  { district: "SAN BORJA", latitude: -12.1, longitude: -77.0, total_pim: 20662561, total_devengado: 20662561, execution_pct: 99.9, categories: {"AMBIENTE":{pim:18365764,devengado:16173410,pct:88.1},"VIVIENDA Y DESARROLLO URBANO":{pim:1377793,devengado:1377793,pct:99.9},"TRANSPORTE":{pim:400686,devengado:345007,pct:86.1}} },
  { district: "LURIN", latitude: -12.2667, longitude: -76.8667, total_pim: 19716029, total_devengado: 19716029, execution_pct: 99.9, categories: {"AMBIENTE":{pim:14844890,devengado:14098629,pct:95.0},"ORDEN PUBLICO Y SEGURIDAD":{pim:4871139,devengado:3945808,pct:81.0},"SALUD":{pim:0,devengado:0,pct:0}} },
  { district: "ATE", latitude: -12.0263, longitude: -76.9186, total_pim: 16753113, total_devengado: 15316129, execution_pct: 91.4, categories: {"EDUCACION":{pim:14512387,devengado:13080296,pct:90.1},"VIVIENDA Y DESARROLLO URBANO":{pim:2104719,devengado:2104433,pct:99.9},"PROTECCION SOCIAL":{pim:101400,devengado:101400,pct:99.9}} },
  { district: "SAN LUIS", latitude: -12.0833, longitude: -77.0, total_pim: 16578435, total_devengado: 10640795, execution_pct: 64.2, categories: {"AMBIENTE":{pim:7408414,devengado:6874666,pct:92.8},"TRANSPORTE":{pim:5659671,devengado:2389708,pct:42.2},"SANEAMIENTO":{pim:1607003,devengado:322740,pct:20.1}} },
  { district: "SURQUILLO", latitude: -12.1167, longitude: -77.0167, total_pim: 15275584, total_devengado: 11696466, execution_pct: 76.6, categories: {"AMBIENTE":{pim:12255567,devengado:9656701,pct:78.8},"VIVIENDA Y DESARROLLO URBANO":{pim:1325865,devengado:732863,pct:55.3},"TRANSPORTE":{pim:878406,devengado:0,pct:0}} },
  { district: "BARRANCO", latitude: -12.15, longitude: -77.0167, total_pim: 12745887, total_devengado: 12294078, execution_pct: 96.5, categories: {"AMBIENTE":{pim:7741570,devengado:7151479,pct:92.4},"CULTURA Y DEPORTE":{pim:4786825,devengado:4028018,pct:84.1},"TRANSPORTE":{pim:142492,devengado:141073,pct:99.0}} },
  { district: "LA PERLA", latitude: -12.0667, longitude: -77.1167, total_pim: 11179188, total_devengado: 7021384, execution_pct: 62.8, categories: {"AMBIENTE":{pim:8580814,devengado:6942643,pct:80.9},"TRANSPORTE":{pim:2598374,devengado:78742,pct:3.0},"SALUD":{pim:0,devengado:0,pct:0}} },
  { district: "CARMEN DE LA LEGUA REYNOSO", latitude: -12.05, longitude: -77.1, total_pim: 9611175, total_devengado: 7788168, execution_pct: 81.0, categories: {"AMBIENTE":{pim:8613499,devengado:7788168,pct:90.4},"EDUCACION":{pim:997676,devengado:0,pct:0},"TRANSPORTE":{pim:0,devengado:0,pct:0}} },
  { district: "MI PERU", latitude: -11.8667, longitude: -77.1167, total_pim: 7837816, total_devengado: 4728696, execution_pct: 60.3, categories: {"AMBIENTE":{pim:5566353,devengado:4705884,pct:84.5},"VIVIENDA Y DESARROLLO URBANO":{pim:2002463,devengado:22812,pct:1.1},"TRANSPORTE":{pim:269000,devengado:0,pct:0}} },
  { district: "SANTIAGO DE SURCO", latitude: -12.1333, longitude: -77.0, total_pim: 6756064, total_devengado: 4983337, execution_pct: 73.8, categories: {"CULTURA Y DEPORTE":{pim:4630742,devengado:4546300,pct:98.2},"TRANSPORTE":{pim:1842799,devengado:197195,pct:10.7},"VIVIENDA Y DESARROLLO URBANO":{pim:200100,devengado:200100,pct:99.9}} },
  { district: "CHACLACAYO", latitude: -11.9833, longitude: -76.7667, total_pim: 6185636, total_devengado: 4473487, execution_pct: 72.3, categories: {"AMBIENTE":{pim:4930625,devengado:3594994,pct:72.9},"VIVIENDA Y DESARROLLO URBANO":{pim:627807,devengado:256781,pct:40.9},"TRANSPORTE":{pim:605204,devengado:599712,pct:99.1}} },
  { district: "PUNTA NEGRA", latitude: -12.3667, longitude: -76.8, total_pim: 6051513, total_devengado: 5526355, execution_pct: 91.3, categories: {"CULTURA Y DEPORTE":{pim:3523028,devengado:3446205,pct:97.8},"AMBIENTE":{pim:2394894,devengado:2038150,pct:85.1},"TRANSPORTE":{pim:115591,devengado:24000,pct:20.8}} },
  { district: "PUCUSANA", latitude: -12.4833, longitude: -76.8, total_pim: 4659162, total_devengado: 3256090, execution_pct: 69.9, categories: {"AMBIENTE":{pim:2710073,devengado:2182624,pct:80.5},"CULTURA Y DEPORTE":{pim:1313182,devengado:140972,pct:10.7},"TRANSPORTE":{pim:343575,devengado:325477,pct:94.7}} },
  { district: "SAN BARTOLO", latitude: -12.3833, longitude: -76.7833, total_pim: 3706076, total_devengado: 3197219, execution_pct: 86.3, categories: {"AMBIENTE":{pim:2953721,devengado:2454142,pct:83.1},"VIVIENDA Y DESARROLLO URBANO":{pim:750528,devengado:743077,pct:99.0},"EDUCACION":{pim:1827,devengado:0,pct:0}} },
  { district: "PUNTA HERMOSA", latitude: -12.3333, longitude: -76.8167, total_pim: 3287512, total_devengado: 2682322, execution_pct: 81.6, categories: {"AMBIENTE":{pim:2776549,devengado:2228922,pct:80.3},"TRANSPORTE":{pim:495298,devengado:453400,pct:91.5},"CULTURA Y DEPORTE":{pim:15665,devengado:0,pct:0}} },
  { district: "LA PUNTA", latitude: -12.0667, longitude: -77.1667, total_pim: 3133266, total_devengado: 2732090, execution_pct: 87.2, categories: {"AMBIENTE":{pim:3021733,devengado:2662963,pct:88.1},"TRANSPORTE":{pim:111533,devengado:69128,pct:62.0},"EDUCACION":{pim:0,devengado:0,pct:0}} },
  { district: "SANTA MARIA DEL MAR", latitude: -12.4, longitude: -76.7667, total_pim: 1615156, total_devengado: 1274841, execution_pct: 78.9, categories: {"AMBIENTE":{pim:1325547,devengado:1149841,pct:86.7},"PROTECCION SOCIAL":{pim:158609,devengado:15000,pct:9.5},"ORDEN PUBLICO Y SEGURIDAD":{pim:81000,devengado:81000,pct:99.9}} },
  { district: "BREÑA", latitude: -12.0667, longitude: -77.05, total_pim: 85384, total_devengado: 60354, execution_pct: 70.7, categories: {"PLANEAMIENTO, GESTION Y RESERVA DE CONTINGENCIA":{pim:60000,devengado:60000,pct:100},"EDUCACION":{pim:25384,devengado:354,pct:1.4}} },
];

export async function getAggregatedDistrictDataAsync(): Promise<AggregatedDistrictData[]> {
  return VERIFIED_2025_DATA;
}

// Sync fallback
export const getAggregatedDistrictData = (): AggregatedDistrictData[] => {
  return VERIFIED_2025_DATA;
};

export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `S/ ${(amount / 1000000).toFixed(2)}m`;
  }
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0
  }).format(amount);
};