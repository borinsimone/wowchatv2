import React from "react";
import { AnimatePresence } from "framer-motion";
import { Toast } from "./Toast";
import type { ToastProps } from "./Toast";
import styles from "./ToastContainer.module.css";

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<
  ToastContainerProps
> = ({ toasts, onRemoveToast }) => {
  return (
    <div className={styles.toastContainer}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onRemoveToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
