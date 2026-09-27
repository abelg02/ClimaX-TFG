import type { ConditionGroup } from '../../../types';
import styles from './WeatherIcon.module.css';

type Props = {
  group: ConditionGroup | string;
  isDay?: boolean;
  size?: number;
  animated?: boolean;
  title?: string;
};

const CLOUD =
  'M22 48H46c5.5 0 10-4.5 10-10 0-5.2-4-9.4-9.1-9.9C45.3 21.3 39.3 16 32 16c-6.6 0-12.1 4.4-13.8 10.4C13.5 27.3 10 31.3 10 36c0 6.6 5.4 12 12 12z';

const Sun = ({ small }: { small?: boolean }) => (
  <g className={styles.sun} transform={small ? 'translate(-9 -9) scale(.72)' : undefined}>
    <g className={styles.rays}>
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="32" y1="6" x2="32" y2="12" transform={`rotate(${i * 45} 32 32)`} />
      ))}
    </g>
    <circle cx="32" cy="32" r="13" />
  </g>
);

const Moon = ({ small }: { small?: boolean }) => (
  <g className={styles.moon} transform={small ? 'translate(-8 -9) scale(.72)' : undefined}>
    <path d="M40 12a20 20 0 1 0 12 30A17 17 0 0 1 40 12z" />
  </g>
);

const Cloud = ({ shade, lift }: { shade?: boolean; lift?: boolean }) => (
  <path
    className={`${styles.cloud} ${shade ? styles.cloudShade : ''}`}
    d={CLOUD}
    transform={lift ? 'translate(0 -8)' : shade ? 'translate(-6 -6) scale(.9)' : undefined}
  />
);

const Drops = ({ count, light }: { count: number; light?: boolean }) => (
  <g className={light ? styles.drizzle : styles.rain}>
    {Array.from({ length: count }, (_, i) => {
      const x = 22 + i * (20 / Math.max(1, count - 1));
      return <line key={i} x1={x} y1="46" x2={x - 3} y2={light ? 51 : 55} style={{ animationDelay: `${i * 0.18}s` }} />;
    })}
  </g>
);

const Flakes = () => (
  <g className={styles.snow}>
    {[22, 32, 42].map((x, i) => (
      <g key={x} style={{ animationDelay: `${i * 0.4}s` }}>
        <circle cx={x} cy="52" r="2.2" />
      </g>
    ))}
  </g>
);

const Bolt = () => <path className={styles.bolt} d="M34 40l-8 12h6l-3 9 10-13h-6l4-8z" />;

const Fog = () => (
  <g className={styles.fog}>
    <line x1="12" y1="48" x2="52" y2="48" />
    <line x1="18" y1="55" x2="46" y2="55" />
  </g>
);

export const WeatherIcon = ({ group, isDay = true, size = 48, animated = true, title }: Props) => {
  const Celestial = isDay ? Sun : Moon;
  let body;
  switch (group) {
    case 'clear':
      body = <Celestial />;
      break;
    case 'partly':
      body = (
        <>
          <Celestial small />
          <g transform="translate(6 6) scale(.85)">
            <Cloud />
          </g>
        </>
      );
      break;
    case 'cloudy':
      body = (
        <>
          <Cloud shade />
          <Cloud />
        </>
      );
      break;
    case 'fog':
      body = (
        <>
          <Cloud lift />
          <Fog />
        </>
      );
      break;
    case 'drizzle':
      body = (
        <>
          <Cloud lift />
          <Drops count={3} light />
        </>
      );
      break;
    case 'rain':
      body = (
        <>
          <Cloud lift />
          <Drops count={4} />
        </>
      );
      break;
    case 'snow':
      body = (
        <>
          <Cloud lift />
          <Flakes />
        </>
      );
      break;
    case 'storm':
      body = (
        <>
          <Cloud shade />
          <Cloud lift />
          <Bolt />
        </>
      );
      break;
    default:
      body = <Cloud />;
  }

  return (
    <svg
      className={`${styles.icon} ${animated ? styles.animated : ''}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {body}
    </svg>
  );
};
