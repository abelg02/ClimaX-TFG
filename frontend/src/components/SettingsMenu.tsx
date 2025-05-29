import { useState, useEffect, useRef } from 'react';
import styles from '../pages/Home.module.css';

export const SettingsMenu = ({ onLogout }: { onLogout: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null); // Referencia al contenedor del menú

    // Cierra el menú si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={menuRef} className={styles.settingsContainer}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.settingsButton}
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
                </div>
            )}
        </div>
    );
};