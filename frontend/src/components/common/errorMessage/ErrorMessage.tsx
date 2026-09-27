import styles from './ErrorMessage.module.css';

type ErrorMessageProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export const ErrorMessage = ({ title = 'Algo ha fallado', message, onRetry }: ErrorMessageProps) => (
  <div className={`panel ${styles.error}`} role="alert">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 16h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 16z" strokeLinejoin="round" />
      <path d="M12 18.5v.5M12 10v5" strokeLinecap="round" />
    </svg>
    <div>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
    {onRetry && (
      <button type="button" onClick={onRetry}>
        Reintentar
      </button>
    )}
  </div>
);
