/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API Spring Boot (por defecto /api, con proxy de Vite en desarrollo). */
  readonly VITE_API_URL?: string
  /** 'direct' fuerza el modo demo: el navegador consulta Open-Meteo sin pasar por el backend. */
  readonly VITE_DATA_SOURCE?: 'api' | 'direct'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
