// frontend/src/components/UVIndex.tsx
import styles from '../pages/Home.module.css';

const getUVIndexLevel = (uv: number) => {
  if (uv <= 2) return 'Bajo';
  if (uv <= 5) return 'Moderado';
  if (uv <= 7) return 'Alto';
  if (uv <= 10) return 'Muy alto';
  return 'Extremo';
};

const getUVIndexColor = (uv: number) => {
  if (uv <= 2) return '#4CAF50';
  if (uv <= 5) return '#FFC107';
  if (uv <= 7) return '#FF9800';
  if (uv <= 10) return '#F44336';
  return '#9C27B0';
};

const getUVProtectionTips = (uv: number) => {
  if (uv <= 2) return 'No se requiere protección.';
  if (uv <= 5) return 'Usa protector solar SPF 30+.';
  if (uv <= 7) return 'Usa protector, gorra y gafas. Evita el sol al mediodía.';
  if (uv <= 10) return 'Protección extrema necesaria. Evita exposición prolongada.';
  return 'Evita completamente la exposición al sol.';
};

export const UVIndex = ({ uv }: { uv: number }) => {
  return (
    <div className={styles.uvContainer}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>☀️</span> Índice UV: {uv} ({getUVIndexLevel(uv)})
      </h3>
      <div
        className={styles.uvBar}
        style={{ backgroundColor: getUVIndexColor(uv) }}
      >
        <div
          className={styles.uvLevel}
          style={{
            width: `${Math.min(100, (uv / 12) * 100)}%`,
            backgroundColor: getUVIndexColor(uv)
          }}
        />
      </div>
      <p>{getUVProtectionTips(uv)}</p>
    </div>
  );
};