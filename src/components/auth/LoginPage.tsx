import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../ui/LoadingSpinner";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const { signInWithGoogle, isLoading, error } = useAuth();

  const handleGoogleSignIn = async () => {
    console.log("LoginPage: Starting Google sign in");
    try {
      await signInWithGoogle();
      console.log("LoginPage: Google sign in successful");
    } catch (err) {
      console.error(
        "LoginPage: Google sign in failed",
        err
      );
    }
  };

  return (
    <div className={styles.loginPage}>
      <motion.div
        className={styles.loginContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.logo}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
          }}
        >
          <div className={styles.logoIcon}>💬</div>
          <h1 className={styles.logoText}>WowChat</h1>
        </motion.div>

        <motion.div
          className={styles.welcomeText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Welcome to WowChat</h2>
          <p>
            Connect with friends and family through
            real-time messaging
          </p>
        </motion.div>

        {error && (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </motion.div>
        )}

        <motion.div
          className={styles.loginActions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            className={styles.googleButton}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <div className={styles.googleIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                Continue with Google
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          className={styles.features}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔒</div>
            <span>Secure & Private</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <span>Real-time Messages</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📱</div>
            <span>Cross-platform</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
