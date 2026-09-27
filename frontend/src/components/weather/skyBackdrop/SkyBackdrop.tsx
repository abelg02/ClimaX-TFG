import { useEffect, useRef } from 'react';
import { useWeather } from '../../../context/WeatherContext';
import styles from './SkyBackdrop.module.css';

type Particle = { x: number; y: number; z: number; s: number; p: number };

const NEUTRAL = { top: '#141a28', bottom: '#05070b', accent: '#dbe3ee' };

/**
 * Fondo a pantalla completa que reproduce el tiempo actual:
 * degradado del cielo + partículas (lluvia, nieve, estrellas, nubes, relámpagos).
 */
export const SkyBackdrop = () => {
  const { sky } = useWeather();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const group = sky?.group ?? 'none';
  const isDay = sky?.isDay ?? false;
  const theme = sky?.theme ?? NEUTRAL;

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--sky-top', theme.top);
    root.setProperty('--sky-bottom', theme.bottom);
    root.setProperty('--accent', theme.accent);
  }, [theme.top, theme.bottom, theme.accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let frame = 0;
    let flash = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const make = (n: number): Particle[] =>
      Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h), z: rand(0.3, 1), s: rand(0, 1), p: rand(0, 6.28) }));

    const rainy = group === 'rain' || group === 'storm';
    const drizzle = group === 'drizzle';
    const snowy = group === 'snow';
    const starry = !isDay && (group === 'clear' || group === 'partly');
    const cloudy = ['partly', 'cloudy', 'fog', 'rain', 'drizzle', 'storm', 'snow'].includes(group);
    const area = (w * h) / (1440 * 900);

    const drops = make(Math.round((rainy ? 220 : drizzle ? 110 : 0) * area));
    const flakes = make(Math.round((snowy ? 160 : 0) * area));
    const stars = make(Math.round((starry ? 170 : 0) * area)).map((s) => ({ ...s, y: s.y * 0.75 }));
    const clouds = make(cloudy ? (group === 'partly' ? 4 : 7) : 0).map((c) => ({ ...c, y: rand(-0.1, 0.45) * h }));
    const cloudTone = isDay ? '255 255 255' : '150 165 190';
    const cloudAlpha = group === 'fog' ? 0.16 : group === 'partly' ? 0.07 : 0.1;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      for (const c of clouds) {
        const r = 220 + c.z * 260;
        c.x += c.z * 0.12;
        if (c.x - r > w) c.x = -r;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
        g.addColorStop(0, `rgb(${cloudTone} / ${cloudAlpha})`);
        g.addColorStop(1, `rgb(${cloudTone} / 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
      }

      for (const s of stars) {
        const a = 0.25 + 0.75 * Math.abs(Math.sin(t / 1400 + s.p)) * s.z;
        ctx.fillStyle = `rgb(255 255 255 / ${a})`;
        ctx.fillRect(s.x, s.y, s.z * 1.6, s.z * 1.6);
      }

      if (drops.length) {
        ctx.strokeStyle = drizzle ? 'rgb(186 230 253 / 0.28)' : 'rgb(186 230 253 / 0.35)';
        ctx.lineCap = 'round';
        for (const d of drops) {
          const len = (drizzle ? 7 : 16) * d.z;
          ctx.lineWidth = d.z * (drizzle ? 1 : 1.3);
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - len * 0.18, d.y + len);
          ctx.stroke();
          d.y += (drizzle ? 5 : 13) * d.z;
          d.x -= (drizzle ? 0.6 : 2) * d.z;
          if (d.y > h) {
            d.y = -20;
            d.x = rand(0, w + 100);
          }
        }
      }

      for (const f of flakes) {
        ctx.fillStyle = `rgb(255 255 255 / ${0.35 + f.z * 0.5})`;
        ctx.beginPath();
        ctx.arc(f.x + Math.sin(t / 900 + f.p) * 12 * f.z, f.y, f.z * 2.4, 0, 6.28);
        ctx.fill();
        f.y += 0.7 * f.z + 0.2;
        if (f.y > h + 5) {
          f.y = -5;
          f.x = rand(0, w);
        }
      }

      if (group === 'storm') {
        if (flash <= 0 && Math.random() < 0.003) flash = 1;
        if (flash > 0) {
          ctx.fillStyle = `rgb(220 215 255 / ${flash * 0.22})`;
          ctx.fillRect(0, 0, w, h);
          flash -= 0.04;
        }
      }
    };

    const loop = (t: number) => {
      draw(t);
      frame = requestAnimationFrame(loop);
    };

    if (reduced) draw(0);
    else frame = requestAnimationFrame(loop);

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !reduced) frame = requestAnimationFrame(loop);
    };
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [group, isDay]);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.gradient} />
      {group === 'clear' && isDay && <div className={styles.sunGlow} />}
      {!isDay && (group === 'clear' || group === 'partly') && <div className={styles.moonGlow} />}
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.horizon} />
    </div>
  );
};
