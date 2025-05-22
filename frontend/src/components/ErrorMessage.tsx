// frontend/src/components/ErrorMessage.tsx
import styles from '../pages/Home.module.css';

type ErrorMessageProps = {
    message: string;
};

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
    return (
        <div className={styles.errorMessage}>
            {message}
        </div>
    );
};