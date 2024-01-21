// URL for the Warszawa UM API
export const API_URL: string = "https://api.um.warszawa.pl";

// Type for the coordinates (latitude and longitude)
type Coordinates = [number, number];

export const DEFAULT_MAP_BOUNDARIES: [Coordinates, Coordinates] = [
  [52.098, 20.6619], // south-west
  [52.4451, 21.3912], // north-east
];

// Map Default values
export const DEFAULT_MAP_CENTER: Coordinates = [52.2333, 21.0138];
export const DEFAULT_MAP_ZOOM: number = 15;
export const MAP_ZOOM_CLUSTER_APPEAR: number = 13.5;
export const DEFAULT_MAP_MIN_ZOOM: number = 12;
export const DEFAULT_MAP_MAX_ZOOM: number = 18;
export const MAP_ZOOM_SNAP: number = 0.25;
export const MAP_ZOOM_DELTA: number = 1.0;
export const MAP_WHEEL_PX_PER_ZOOM_LEVEL: number = 100.0;
export const MAP_INTERTIA_DECELERATION: number = 4000.0;
