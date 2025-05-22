// frontend/src/components/TemperatureChart.tsx
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
        </div>
    );
};