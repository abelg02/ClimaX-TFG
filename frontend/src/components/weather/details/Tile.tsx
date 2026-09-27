import type { ReactNode } from 'react';
import styles from './Details.module.css';

type TileProps = {
  title: string;
  value: ReactNode;
  unit?: string;
  caption?: ReactNode;
  wide?: boolean;
  children?: ReactNode;
};

/** Tarjeta de indicador: título, valor principal, visual opcional y explicación. */
export const Tile = ({ title, value, unit, caption, wide, children }: TileProps) => (
  <article className={`panel ${styles.tile} ${wide ? styles.wide : ''}`}>
    <h3 className="eyebrow">{title}</h3>
    <p className={styles.value}>
      {value}
      {unit && <span className={styles.unit}>{unit}</span>}
    </p>
    {children}
    {caption && <p className={styles.caption}>{caption}</p>}
  </article>
);

type ScaleProps = { position: number; gradient: string; labels?: string[] };

/** Barra de escala con un marcador en la posición (0–1). */
export const Scale = ({ position, gradient, labels }: ScaleProps) => (
  <div className={styles.scaleWrap}>
    <div className={styles.scale} style={{ background: gradient }}>
      <i style={{ left: `${Math.min(1, Math.max(0, position)) * 100}%` }} />
    </div>
    {labels && (
      <div className={`${styles.scaleLabels} mono`}>
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    )}
  </div>
);
