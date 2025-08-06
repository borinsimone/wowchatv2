import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

const LoadingSpinner = ({
  size = "medium",
  color,
}: LoadingSpinnerProps) => {
  return (
    <div className={`${styles.spinner} ${styles[size]}`}>
      <div
        className={styles.ring}
        style={
          color ? { borderTopColor: color } : undefined
        }
      />
    </div>
  );
};

export default LoadingSpinner;
