# ClimaX · Frontend

React 19 + TypeScript + Vite. La documentación completa del proyecto está en el [README principal](../README.md).

```bash
npm install
npm run dev      # http://localhost:5173 (usa la API en :8080 si está arrancada)
npm run build    # compilación de producción en dist/
npm run lint
```

Variables opcionales (fichero `.env.local`):

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | URL de la API Spring Boot (por defecto `/api`, con proxy a `localhost:8080`) |
| `VITE_DATA_SOURCE=direct` | Modo demo: consulta Open-Meteo directamente sin backend |
