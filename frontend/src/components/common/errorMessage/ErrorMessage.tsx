// frontend/src/components/common/errorMessage/ErrorMessage.tsx
import styles from './ErrorMessage.module.css';

type ErrorMessageProps = {
    message: string;
    onClose?: () => void;
};

export const ErrorMessage = ({ message, onClose }: ErrorMessageProps) => {
    return (
        <div className={styles.errorMessage}>
            {message}
            {onClose && (
                <button onClick={onClose} className={styles.errorCloseButton}>
                    ×
                </button>
            )}
        </div>
    );
};