import React, { createContext, useContext } from "react";
import { useToast } from "../hooks/useToast";

interface ToastContextType {
  showSuccess: (
    message: string,
    duration?: number
  ) => string;
  showError: (message: string, duration?: number) => string;
  showWarning: (
    message: string,
    duration?: number
  ) => string;
  showInfo: (message: string, duration?: number) => string;
  clearAllToasts: () => void;
}

const ToastContext = createContext<
  ToastContextType | undefined
>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error(
      "useToastContext must be used within a ToastProvider"
    );
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<
  ToastProviderProps
> = ({ children }) => {
  const {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllToasts,
  } = useToast();

  const value: ToastContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render ToastContainer here so it's always available */}
      {toasts.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{ marginBottom: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  backgroundColor:
                    toast.type === "success"
                      ? "#f0f9ff"
                      : toast.type === "error"
                      ? "#fef2f2"
                      : toast.type === "warning"
                      ? "#fffbeb"
                      : "#f0f9ff",
                  border: `1px solid ${
                    toast.type === "success"
                      ? "#22c55e"
                      : toast.type === "error"
                      ? "#ef4444"
                      : toast.type === "warning"
                      ? "#f59e0b"
                      : "#3b82f6"
                  }`,
                  color:
                    toast.type === "success"
                      ? "#166534"
                      : toast.type === "error"
                      ? "#dc2626"
                      : toast.type === "warning"
                      ? "#d97706"
                      : "#1d4ed8",
                }}
              >
                <span>
                  {toast.type === "success"
                    ? "✅"
                    : toast.type === "error"
                    ? "❌"
                    : toast.type === "warning"
                    ? "⚠️"
                    : "ℹ️"}
                </span>
                <span>{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    padding: "0 4px",
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
