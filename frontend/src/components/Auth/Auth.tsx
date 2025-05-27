// frontend/src/components/Auth/Auth.tsx
import { useState } from 'react';
import styles from '../../pages/Home.module.css';

export const Auth = ({ onLogin }: { onLogin: () => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            // Lógica de login
            const users = JSON.parse(localStorage.getItem('weatherUsers') || '[]');
            const user = users.find((u: any) => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('weatherCurrentUser', JSON.stringify(user));
                onLogin();
            } else {
                setError('Credenciales incorrectas');
            }
        } else {
            // Lógica de registro
            if (!name || !email || !password) {
                setError('Todos los campos son obligatorios');
                return;
            }

            const users = JSON.parse(localStorage.getItem('weatherUsers') || '[]');

            if (users.some((u: any) => u.email === email)) {
                setError('El email ya está registrado');
                return;
            }

            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password // En un caso real, esto debería estar encriptado
            };

            localStorage.setItem('weatherUsers', JSON.stringify([...users, newUser]));
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