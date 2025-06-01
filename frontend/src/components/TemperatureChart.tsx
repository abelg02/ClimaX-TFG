import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import styles from '../pages/Home.module.css';

type TemperatureChartProps = {
    hourlyData: Array<{
        time: string;
        temp: number;
    }>;
};

export const TemperatureChart = ({ hourlyData }: TemperatureChartProps) => {
    // Calcular estadísticas
    const maxTemp = Math.max(...hourlyData.map(item => item.temp));
    const minTemp = Math.min(...hourlyData.map(item => item.temp));
    const avgTemp = (hourlyData.reduce((sum, item) => sum + item.temp, 0) / hourlyData.length);
    const maxTempTime = hourlyData.find(item => item.temp === maxTemp)?.time;
    const minTempTime = hourlyData.find(item => item.temp === minTemp)?.time;

    return (
        <div className={styles.chartContainer}>
            <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '1.5rem' }}>📈</div>

            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>⏱</span> Temperatura por horas
            </h3>
            <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={hourlyData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="time" tick={{ fill: '#666' }} tickLine={{ stroke: '#eee' }} />
                        <YAxis unit="°C" tick={{ fill: '#666' }} tickLine={{ stroke: '#eee' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                border: 'none'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="temp"
                            stroke="#007bff"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6, stroke: '#007bff', strokeWidth: 2, fill: 'white' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Sección de estadísticas */}
            <div className={styles.chartStats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Máxima:</span>
                    <span className={styles.statValue}>{maxTemp.toFixed(1)}°C</span>
                    <span className={styles.statTime}>{maxTempTime}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Media:</span>
                    <span className={styles.statValue}>{avgTemp.toFixed(1)}°C</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Mínima:</span>
                    <span className={styles.statValue}>{minTemp.toFixed(1)}°C</span>
                    <span className={styles.statTime}>{minTempTime}</span>
                </div>
            </div>

            {/* Leyenda de temperatura modificada */}
            <div className={styles.tempLegend}>
                <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: '#ff6b6b' }}></div>
                    <span>Máxima del día</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: '#007bff' }}></div>
                    <span>Temperatura media</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: '#6bc5ff' }}></div>
                    <span>Mínima del día</span>
                </div>
            </div>
        </div>
    );
};