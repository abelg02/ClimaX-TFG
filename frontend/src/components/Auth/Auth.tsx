// frontend/src/components/Auth/Auth.tsx
import { useState } from 'react';
import styles from '../../pages/Home.module.css';
import { addUser, getUserByEmail } from '../../services/db';

export const Auth = ({ onLogin }: { onLogin: () => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            // Lógica de login con IndexedDB
            const user = await getUserByEmail(email);

            if (user && user.password === password) {
                localStorage.setItem('weatherCurrentUser', JSON.stringify(user));
                onLogin();
            } else {
                setError('Credenciales incorrectas');
            }
        } else {
            // Lógica de registro con IndexedDB
            if (!name || !email || !password) {
                setError('Todos los campos son obligatorios');
                return;
            }

            const existingUser = await getUserByEmail(email);
            if (existingUser) {
                setError('El email ya está registrado');
                return;
            }

            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password // ⚠️ En producción, esto debería estar encriptado
            };

            await addUser(newUser);
            localStorage.setItem('weatherCurrentUser', JSON.stringify(newUser));
            onLogin();
        }
    };

    return (
        <div className={styles.authContainer}>
            <h2>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <div className={styles.formGroup}>
                        <label>Nombre:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className={styles.authButton}>
                    {isLogin ? 'Iniciar sesión' : 'Registrarse'}
                </button>
            </form>

            <p className={styles.authToggle} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </p>
        </div>
    );
};