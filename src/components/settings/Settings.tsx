import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { AuthService } from "../../services/authService";
import styles from "./Settings.module.css";

export const Settings: React.FC = () => {
  const { user } = useAppStore();
  const {
    preferences,
    updateTheme,
    updateNotifications,
    updatePrivacy,
    resetToDefaults,
    exportPreferences,
  } = useUserPreferences();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  const handleThemeChange = (
    newTheme: "light" | "dark" | "system"
  ) => {
    updateTheme(newTheme);
  };

  const handleNotificationChange = (
    key: keyof typeof preferences.notifications
  ) => {
    updateNotifications({
      [key]: !preferences.notifications[key],
    });
  };

  const handlePrivacyChange = (
    key: keyof typeof preferences.privacy,
    value: string
  ) => {
    updatePrivacy({
      [key]: value as "everyone" | "contacts" | "nobody",
    });
  };

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h2>Impostazioni</h2>
      </div>

      <div className={styles.settingsContent}>
        {/* Profilo utente */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className={styles.sectionTitle}>Profilo</h3>

          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" />
              ) : (
                <div className={styles.avatarFallback}>
                  {user?.displayName
                    ?.charAt(0)
                    .toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "?"}
                </div>
              )}
            </div>

            <div className={styles.profileInfo}>
              <h4>{user?.displayName || "Utente"}</h4>
              <p>{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Tema */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className={styles.sectionTitle}>Aspetto</h3>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span>Tema</span>
              <p>Scegli come vuoi visualizzare WowChat</p>
            </div>

            <div className={styles.themeSelector}>
              <button
                className={`${styles.themeButton} ${
                  preferences.theme === "light"
                    ? styles.active
                    : ""
                }`}
                onClick={() => handleThemeChange("light")}
              >
                ☀️ Chiaro
              </button>
              <button
                className={`${styles.themeButton} ${
                  preferences.theme === "dark"
                    ? styles.active
                    : ""
                }`}
                onClick={() => handleThemeChange("dark")}
              >
                🌙 Scuro
              </button>
              <button
                className={`${styles.themeButton} ${
                  preferences.theme === "system"
                    ? styles.active
                    : ""
                }`}
                onClick={() => handleThemeChange("system")}
              >
                💻 Sistema
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifiche */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className={styles.sectionTitle}>Notifiche</h3>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span>Suoni</span>
              <p>Riproduci suoni per i nuovi messaggi</p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={preferences.notifications.sound}
                onChange={() =>
                  handleNotificationChange("sound")
                }
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span>Notifiche desktop</span>
              <p>Mostra notifiche sul desktop</p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={preferences.notifications.desktop}
                onChange={() =>
                  handleNotificationChange("desktop")
                }
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span>Email</span>
              <p>Ricevi notifiche via email</p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={preferences.notifications.email}
                onChange={() =>
                  handleNotificationChange("email")
                }
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={styles.sectionTitle}>Privacy</h3>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span>Ultimo accesso</span>
              <p>
                Chi può vedere quando sei stato online
                l'ultima volta
              </p>
            </div>
            <select
              className={styles.select}
              value={preferences.privacy.lastSeen}
              onChange={(e) =>
                handlePrivacyChange(
                  "lastSeen",
                  e.target.value
                )
              }
            >
              <option value="everyone">Tutti</option>
              <option value="contacts">
                Solo contatti
              </option>
              <option value="nobody">Nessuno</option>
            </select>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span>Stato online</span>
              <p>Chi può vedere se sei online</p>
            </div>
            <select
              className={styles.select}
              value={preferences.privacy.onlineStatus}
              onChange={(e) =>
                handlePrivacyChange(
                  "onlineStatus",
                  e.target.value
                )
              }
            >
              <option value="everyone">Tutti</option>
              <option value="contacts">
                Solo contatti
              </option>
              <option value="nobody">Nessuno</option>
            </select>
          </div>
        </motion.div>

        {/* Info app */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={styles.sectionTitle}>
            Gestione Preferenze
          </h3>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span>Backup Impostazioni</span>
              <p>
                Esporta le tue preferenze per conservarle
              </p>
            </div>
            <button
              className={styles.actionButton}
              onClick={exportPreferences}
            >
              📥 Esporta
            </button>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span>Ripristina Impostazioni</span>
              <p>Torna alle impostazioni predefinite</p>
            </div>
            <button
              className={styles.dangerButton}
              onClick={() => {
                if (
                  window.confirm(
                    "Sei sicuro di voler ripristinare tutte le impostazioni?"
                  )
                ) {
                  resetToDefaults();
                }
              }}
            >
              🔄 Reset
            </button>
          </div>
        </motion.div>

        {/* Info app */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className={styles.sectionTitle}>
            Informazioni
          </h3>

          <div className={styles.infoItem}>
            <span>Versione</span>
            <span>1.0.0</span>
          </div>

          <div className={styles.infoItem}>
            <span>Sviluppatore</span>
            <span>WowChat Team</span>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut
              ? "Disconnessione..."
              : "Disconnetti"}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
