// frontend/src/services/regionService.ts

// Cache simple para no hacer llamadas repetidas
const regionCache = new Map<string, {name: string, lat: number, lng: number}[]>();

export const getProvincesForRegion = async (region: string): Promise<{name: string, lat: number, lng: number}[]> => {
  // 1. Primero verificar si tenemos datos en caché
  if (regionCache.has(region)) {
    return regionCache.get(region)!;
  }

  try {
    // 2. Buscar la región en Nominatim (OpenStreetMap)
    const searchResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region)}, Spain&format=json&polygon_geojson=1&type=administrative`
    );

    const searchData = await searchResponse.json();
    if (!searchData || searchData.length === 0) return [];

    // 3. Buscar elementos administrativos dentro de la región (provincias)
    const provincesResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=province+in+${encodeURIComponent(region)}&format=json&type=administrative&limit=50`
    );

    const provincesData = await provincesResponse.json();

    // 4. Procesar resultados - intentamos obtener las capitales de provincia si no encontramos las provincias directamente
    let provinces = provincesData
      .filter((item: any) => item.type === 'administrative')
      .map((item: any) => ({
        name: item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));

    // Si no encontramos provincias, buscamos ciudades importantes en la región
    if (provinces.length === 0) {
      const citiesResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=city+in+${encodeURIComponent(region)}&format=json&type=city&limit=50`
      );
      const citiesData = await citiesResponse.json();
      provinces = citiesData.map((item: any) => ({
        name: item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    }

    // 5. Cachear los resultados
    regionCache.set(region, provinces);

    return provinces;
  } catch (error) {
    console.error('Error fetching region data:', error);
    return [];
  }
};

// Coordenadas aproximadas para el centro del mapa por región
const REGION_CENTERS: Record<string, [number, number]> = {
  'Andalucía': [37.5, -4.5],
  'Comunidad Valenciana': [39.5, -0.5],
  'Cataluña': [41.8, 1.6],
  'Madrid': [40.4, -3.7],
  'Galicia': [42.75, -7.9],
  'Castilla y León': [41.65, -4.72],
  'País Vasco': [43.0, -2.75],
  'Aragón': [41.65, -0.88],
  'Castilla-La Mancha': [39.5, -3.0],
  'Islas Canarias': [28.3, -16.6],
  'Región de Murcia': [38.0, -1.5],
  'Extremadura': [39.0, -6.0],
  'Principado de Asturias': [43.35, -5.85],
  'Comunidad Foral de Navarra': [42.8, -1.65],
  'Cantabria': [43.35, -4.0],
  'La Rioja': [42.45, -2.45],
  'Islas Baleares': [39.5, 3.0]
};

export const getRegionCenter = (region: string): [number, number] => {
  return REGION_CENTERS[region] || [40.0, -3.7]; // Centro de España por defecto
};