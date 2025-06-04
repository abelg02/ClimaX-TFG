// frontend/src/components/auth/Auth.tsx
import { useState } from 'react';
import styles from './Auth.module.css';
import { registerUser, loginUser } from '../../services/firebase';

export const Auth = ({ onLogin }: { onLogin: () => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                await loginUser(email, password);
            } else {
                await registerUser(email, password);
                // await saveUserData(user.uid, name); // Descomentar cuando tengas el user
            }
            onLogin();
        } catch (err: any) {
            setError(getFirebaseError(err.code));
        }
    };

    const getFirebaseError = (code: string) => {
        switch(code) {
            case 'auth/invalid-email': return 'Email no válido';
            case 'auth/user-disabled': return 'Usuario deshabilitado';
            case 'auth/user-not-found': return 'Usuario no encontrado';
            case 'auth/wrong-password': return 'Contraseña incorrecta';
            case 'auth/email-already-in-use': return 'El email ya está registrado';
            case 'auth/weak-password': return 'La contraseña es demasiado débil';
            default: return 'Error al autenticar';
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authHeader}>
                <div className={styles.authLogo}>
                    <span>🌤️</span>
                    <h1>ClimaX</h1>
                </div>
                <h2>{isLogin ? 'Inicia sesión' : 'Regístrate'}</h2>
                <p>{isLogin ? 'Accede a tu cuenta para ver el clima' : 'Crea una cuenta para comenzar'}</p>
            </div>

            {error && <div className={styles.authError}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.authForm}>
                {!isLogin && (
                    <div className={styles.formGroup}>
                        <label>Nombre completo</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                            />
                            <span className={styles.inputIcon}>👤</span>
                        </div>
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label>Correo electrónico</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ej: usuario@ejemplo.com"
                        />
                        <span className={styles.inputIcon}>✉️</span>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Contraseña</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isLogin ? 'Introduce tu contraseña' : 'Mínimo 6 caracteres'}
                        />
                        <span className={styles.inputIcon}>🔒</span>
                    </div>
                </div>

                <button type="submit" className={styles.authButton}>
                    {isLogin ? 'Iniciar sesión' : 'Registrarse'}
                </button>

                <div className={styles.authDivider}>
                    <span>o</span>
                </div>

            </form>

            <div className={styles.authFooter}>
                <p>
                    {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className={styles.authToggle}
                    >
                        {isLogin ? ' Regístrate' : ' Inicia sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
};