import { useState, useCallback } from "react";
import type { ToastProps } from "../components/ui/Toast";

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: ToastProps["type"] = "info",
      duration: number = 4000
    ) => {
      const id = Date.now().toString();
      const toast: ToastProps = {
        id,
        message,
        type,
        duration,
        onClose: () => {}, // Will be set by ToastContainer
      };

      setToasts((prev) => [...prev, toast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "success", duration),
    [addToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "error", duration),
    [addToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "warning", duration),
    [addToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "info", duration),
    [addToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllToasts,
  };
};
