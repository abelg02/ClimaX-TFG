import { ErrorMessage } from '../../components/common/errorMessage/ErrorMessage';
import { PlacesStrip } from '../../components/places/PlacesStrip';
import { WeatherIcon } from '../../components/weather/weatherIcon/WeatherIcon';
import styles from './WelcomeScreen.module.css';

type Props = { message: string; onRetry: () => void };

/** Pantalla que se muestra cuando no se puede cargar la previsión. */
export const WelcomeScreen = ({ message, onRetry }: Props) => (
  <div className={styles.screen}>
    <div className={styles.intro}>
      <WeatherIcon group="storm" isDay={false} size={96} />
      <h1>
        El cielo no <em>responde</em>
      </h1>
      <p>Prueba otra ciudad desde el buscador o elige una de estas.</p>
    </div>
    <ErrorMessage title="Previsión no disponible" message={message} onRetry={onRetry} />
    <PlacesStrip />
  </div>
);
