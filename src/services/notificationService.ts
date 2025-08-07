import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Notification, User } from "../types";

export class NotificationService {
  // Send a notification to a user
  static async sendNotification(
    recipientId: string,
    sender: User,
    type: Notification["type"],
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const notificationId = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const notificationRef = doc(
        db,
        "notifications",
        notificationId
      );

      const notification: Omit<Notification, "id"> = {
        recipientId,
        senderId: sender.uid,
        senderName: sender.displayName,
        senderPhotoURL: sender.photoURL,
        type,
        title,
        message,
        data: data || {},
        isRead: false,
        createdAt: serverTimestamp() as any,
      };

      await setDoc(notificationRef, notification);
      console.log(
        "Notification sent successfully:",
        notificationId
      );
    } catch (error) {
      console.error("Error sending notification:", error);
      throw new Error("Failed to send notification");
    }
  }

  // Listen to user notifications
  static listenToUserNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ) {
    const notificationsRef = collection(
      db,
      "notifications"
    );
    const q = query(
      notificationsRef,
      where("recipientId", "==", userId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications: Notification[] = [];
        snapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data(),
          } as Notification);
        });
        callback(notifications);
      },
      (error) => {
        console.error(
          "Error listening to notifications:",
          error
        );
        callback([]);
      }
    );
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<Notification[]> {
    try {
      const notificationsRef = collection(
        db,
        "notifications"
      );
      const q = query(
        notificationsRef,
        where("recipientId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const notifications: Notification[] = [];

      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        } as Notification);
      });

      return notifications.slice(0, limit);
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(
    notificationId: string
  ): Promise<void> {
    try {
      const notificationRef = doc(
        db,
        "notifications",
        notificationId
      );
      await updateDoc(notificationRef, {
        isRead: true,
      });
    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error
      );
      throw new Error(
        "Failed to mark notification as read"
      );
    }
  }

  // Mark all user notifications as read
  static async markAllAsRead(
    userId: string
  ): Promise<void> {
    try {
      const notificationsRef = collection(
        db,
        "notifications"
      );
      const q = query(
        notificationsRef,
        where("recipientId", "==", userId),
        where("isRead", "==", false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, { isRead: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        error
      );
      throw new Error(
        "Failed to mark all notifications as read"
      );
    }
  }

  // Delete notification
  static async deleteNotification(
    notificationId: string
  ): Promise<void> {
    try {
      const notificationRef = doc(
        db,
        "notifications",
        notificationId
      );
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Failed to delete notification");
    }
  }

  // Delete all user notifications
  static async deleteAllUserNotifications(
    userId: string
  ): Promise<void> {
    try {
      const notificationsRef = collection(
        db,
        "notifications"
      );
      const q = query(
        notificationsRef,
        where("recipientId", "==", userId)
      );

      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error(
        "Error deleting all notifications:",
        error
      );
      throw new Error("Failed to delete all notifications");
    }
  }

  // Send contact added notification
  static async sendContactAddedNotification(
    recipientId: string,
    sender: User
  ): Promise<void> {
    const title = "Nuovo contatto aggiunto";
    const message = `${sender.displayName} ti ha aggiunto ai suoi contatti`;

    return this.sendNotification(
      recipientId,
      sender,
      "contact_added",
      title,
      message,
      { contactId: sender.uid }
    );
  }
}
