import { useState, useEffect, useCallback } from "react";
import { NotificationService } from "../services/notificationService";
import { useAppStore } from "../store/useAppStore";
import type { Notification } from "../types";

export const useNotifications = () => {
  const { user } = useAppStore();
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Listen to notifications in real-time
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);

    const unsubscribe =
      NotificationService.listenToUserNotifications(
        user.uid,
        (newNotifications) => {
          setNotifications(newNotifications);
          setUnreadCount(
            newNotifications.filter((n) => !n.isRead).length
          );
          setIsLoading(false);
        }
      );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await NotificationService.markAsRead(
          notificationId
        );
        // The listener will automatically update the state
      } catch (error) {
        console.error(
          "Error marking notification as read:",
          error
        );
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await NotificationService.markAllAsRead(user.uid);
      // The listener will automatically update the state
    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        error
      );
    }
  }, [user]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await NotificationService.deleteNotification(
          notificationId
        );
        // The listener will automatically update the state
      } catch (error) {
        console.error(
          "Error deleting notification:",
          error
        );
      }
    },
    []
  );

  const clearAllNotifications = useCallback(async () => {
    if (!user) return;

    try {
      await NotificationService.deleteAllUserNotifications(
        user.uid
      );
      // The listener will automatically update the state
    } catch (error) {
      console.error(
        "Error clearing all notifications:",
        error
      );
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
};
