import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useAppStore } from "./store/useAppStore";
import { useAppInitialization } from "./hooks/useAppInitialization";

// Components
import LoginPage from "./components/auth/LoginPage";
import ChatLayout from "./components/layout/ChatLayout";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Styles
import "./styles/globals.css";
import styles from "./App.module.css";

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { setOnlineStatus } = useAppStore();
  
  // Inizializza le preferenze dell'app (incluso il tema)
  useAppInitialization();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnlineStatus]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className={styles.appLoading}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <ChatLayout />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
