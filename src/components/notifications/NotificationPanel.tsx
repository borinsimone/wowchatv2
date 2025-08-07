import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../hooks/useNotifications";
import { useToastContext } from "../../contexts/ToastContext";
import type { Notification } from "../../types";
import styles from "./NotificationPanel.module.css";

export const NotificationPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();
  const { showSuccess } = useToastContext();

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (
    notification: Notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Show the notification as a toast
    showSuccess(
      `${notification.senderName}: ${notification.message}`,
      6000
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    showSuccess("Tutte le notifiche sono state lette");
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    showSuccess("Tutte le notifiche sono state cancellate");
    setIsOpen(false);
  };

  const getNotificationIcon = (
    type: Notification["type"]
  ) => {
    switch (type) {
      case "contact_added":
        return "👥";
      case "contact_request":
        return "📩";
      case "message":
        return "💬";
      case "chat_invite":
        return "🎉";
      default:
        return "🔔";
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "ora";
    if (diffMinutes < 60) return `${diffMinutes}m fa`;
    if (diffMinutes < 1440)
      return `${Math.floor(diffMinutes / 60)}h fa`;
    return `${Math.floor(diffMinutes / 1440)}g fa`;
  };

  return (
    <div className={styles.notificationContainer}>
      {/* Notification Bell */}
      <button
        className={styles.notificationButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifiche"
      >
        🔔
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.notificationPanel}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.panelHeader}>
              <h3>Notifiche</h3>
              {notifications.length > 0 && (
                <div className={styles.headerActions}>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className={styles.actionButton}
                    >
                      Segna tutte lette
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className={styles.actionButton}
                  >
                    Cancella tutte
                  </button>
                </div>
              )}
            </div>

            <div className={styles.notificationList}>
              {isLoading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}>⏳</div>
                  <span>Caricando notifiche...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔕</div>
                  <span>Nessuna notifica</span>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`${
                      styles.notificationItem
                    } ${
                      notification.isRead
                        ? styles.read
                        : styles.unread
                    }`}
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    whileHover={{
                      backgroundColor:
                        "var(--color-surface-hover)",
                    }}
                    layout
                  >
                    <div
                      className={styles.notificationIcon}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div
                      className={styles.notificationContent}
                    >
                      <div
                        className={styles.notificationTitle}
                      >
                        {notification.title}
                      </div>
                      <div
                        className={
                          styles.notificationMessage
                        }
                      >
                        {notification.message}
                      </div>
                      <div
                        className={styles.notificationTime}
                      >
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>

                    <div
                      className={styles.notificationActions}
                    >
                      {!notification.isRead && (
                        <div className={styles.unreadDot} />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(
                            notification.id
                          );
                        }}
                        className={styles.deleteButton}
                        title="Elimina notifica"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
