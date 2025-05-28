// frontend/src/components/SettingsMenu.tsx
import { useState } from 'react';
import styles from '../pages/Home.module.css';

export const SettingsMenu = ({ onLogout }: { onLogout: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                }}
            >
                ⚙️
            </button>

            {isOpen && (
                <div className={styles.settingsMenu}>
                    <button
                        onClick={onLogout}
                        className={styles.settingsMenuItem}
                    >
                        Cerrar sesión
                    </button>
                    {/* Puedes añadir más opciones aquí */}
                </div>
            )}
        </div>
    );
};