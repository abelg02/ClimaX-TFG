import { useId } from 'react';
import type { Units } from '../../../types';
import { formatTemp, toUnits } from '../../../utils/format';
import { tempColor } from '../../../utils/weatherStyles';

type Props = {
  temperatures: number[];
  columnWidth: number;
  height?: number;
  units: Units;
};

/** Curva suave (Catmull-Rom) de la temperatura, coloreada con la escala térmica. */
export const TemperatureChart = ({ temperatures, columnWidth, height = 96, units }: Props) => {
  const id = useId();
  const width = temperatures.length * columnWidth;
  const top = 26;
  const bottom = 12;
  const values = temperatures.map((t) => toUnits(t, units));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 4);

  const points = values.map((v, i) => ({
    x: i * columnWidth + columnWidth / 2,
    y: top + (1 - (v - min) / range) * (height - top - bottom),
  }));

  let line = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    line += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  const last = points[points.length - 1];
  const area = `${line} L${last.x},${height} L${points[0].x},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0" x2={width} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          {temperatures.map((t, i) => (
            <stop key={i} offset={points[i].x / width} stopColor={tempColor(t)} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.14" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id}-fill)`} />
      <path d={line} fill="none" stroke={`url(#${id}-stroke)`} strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={i === 0 ? 4.5 : 2.6} fill={i === 0 ? 'var(--text)' : tempColor(temperatures[i])} />
          <text
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            fill="var(--text)"
            fontSize="13"
            fontWeight={i === 0 ? 700 : 500}
            fontFamily="var(--font-display)"
          >
            {formatTemp(temperatures[i], units)}
          </text>
        </g>
      ))}
    </svg>
  );
};
