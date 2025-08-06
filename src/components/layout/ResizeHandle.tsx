import styles from "./ResizeHandle.module.css";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

export const ResizeHandle = ({
  onMouseDown,
  isResizing,
}: ResizeHandleProps) => {
  return (
    <div
      className={`${styles.resizeHandle} ${
        isResizing ? styles.active : ""
      }`}
      onMouseDown={onMouseDown}
    >
      <div className={styles.resizeIndicator} />
    </div>
  );
};
