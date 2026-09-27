import { Scale, Tile } from '../details/Tile';

const level = (uv: number) => {
  if (uv < 3) return { label: 'Bajo', advice: 'No hace falta protección especial.' };
  if (uv < 6) return { label: 'Moderado', advice: 'Gafas de sol y crema si pasas tiempo fuera.' };
  if (uv < 8) return { label: 'Alto', advice: 'Busca la sombra en las horas centrales.' };
  if (uv < 11) return { label: 'Muy alto', advice: 'Evita el sol entre las 12:00 y las 17:00.' };
  return { label: 'Extremo', advice: 'Evita exponerte al sol.' };
};

export const UVIndex = ({ uv, max }: { uv: number; max: number }) => {
  const { label, advice } = level(uv);
  return (
    <Tile title="Índice UV" value={Math.round(uv)} unit={label} caption={`${advice} Máximo hoy: ${Math.round(max)}.`}>
      <Scale
        position={uv / 11}
        gradient="linear-gradient(90deg, #34d399, #facc15 30%, #fb923c 55%, #ef4444 75%, #a855f7)"
        labels={['0', '3', '6', '8', '11+']}
      />
    </Tile>
  );
};
