import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Toast.module.css";

export interface ToastProps {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = "info",
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 200); // Wait for animation
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`${styles.toast} ${styles[type]}`}
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.toastContent}>
        <span className={styles.toastIcon}>
          {getIcon()}
        </span>
        <span className={styles.toastMessage}>
          {message}
        </span>
      </div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Chiudi notifica"
      >
        ×
      </button>
    </motion.div>
  );
};
