// frontend/src/components/Auth/Auth.tsx
import { useState } from 'react';
import styles from '../../pages/Home.module.css';
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
                await saveUserData(user.uid, name);
            }
            onLogin();
        } catch (err: any) {
            setError(getFirebaseError(err.code));
        }
    };

    const getFirebaseError = (code: string) => {
        switch(code) {
            case 'auth/invalid-email':
                return 'Email no válido';
            case 'auth/user-disabled':
                return 'Usuario deshabilitado';
            case 'auth/user-not-found':
                return 'Usuario no encontrado';
            case 'auth/wrong-password':
                return 'Contraseña incorrecta';
            case 'auth/email-already-in-use':
                return 'El email ya está registrado';
            case 'auth/weak-password':
                return 'La contraseña es demasiado débil';
            default:
                return 'Error al autenticar';
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