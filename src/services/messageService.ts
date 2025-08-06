import {
  collection,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Message } from "../types";

export class MessageService {
  // Send a text message
  static async sendMessage(
    chatId: string,
    senderId: string,
    text: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Add message to the chat's messages subcollection
      const messageRef = doc(
        collection(db, "chats", chatId, "messages")
      );
      const messageData: Omit<Message, "id"> = {
        senderId,
        text,
        timestamp: serverTimestamp() as any,
        readBy: [senderId], // Sender automatically reads the message
      };

      batch.set(messageRef, messageData);

      // Update chat with last message
      const chatRef = doc(db, "chats", chatId);
      batch.update(chatRef, {
        lastMessage: {
          text,
          senderId,
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }

  // Send an image message
  static async sendImageMessage(
    chatId: string,
    senderId: string,
    imageUrl: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Add message to the chat's messages subcollection
      const messageRef = doc(
        collection(db, "chats", chatId, "messages")
      );
      const messageData: Omit<Message, "id"> = {
        senderId,
        imageUrl,
        timestamp: serverTimestamp() as any,
        readBy: [senderId],
      };

      batch.set(messageRef, messageData);

      // Update chat with last message
      const chatRef = doc(db, "chats", chatId);
      batch.update(chatRef, {
        lastMessage: {
          text: "📷 Image",
          senderId,
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Error sending image message:", error);
      throw new Error("Failed to send image");
    }
  }

  // Listen to messages for a chat
  static listenToMessages(
    chatId: string,
    callback: (messages: Message[]) => void
  ) {
    const messagesRef = collection(
      db,
      "chats",
      chatId,
      "messages"
    );
    const q = query(
      messagesRef,
      orderBy("timestamp", "asc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data(),
          } as Message);
        });
        callback(messages);
      },
      (error) => {
        console.error(
          "Error listening to messages:",
          error
        );
      }
    );
  }

  // Mark message as read
  static async markMessageAsRead(
    chatId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    try {
      const messageRef = doc(
        db,
        "chats",
        chatId,
        "messages",
        messageId
      );
      await updateDoc(messageRef, {
        readBy: arrayUnion(userId),
      });
    } catch (error) {
      console.error(
        "Error marking message as read:",
        error
      );
    }
  }

  // Edit a message
  static async editMessage(
    chatId: string,
    messageId: string,
    newText: string
  ): Promise<void> {
    try {
      const messageRef = doc(
        db,
        "chats",
        chatId,
        "messages",
        messageId
      );
      await updateDoc(messageRef, {
        text: newText,
        edited: true,
        editedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error editing message:", error);
      throw new Error("Failed to edit message");
    }
  }

  // Delete a message
  static async deleteMessage(
    chatId: string,
    messageId: string
  ): Promise<void> {
    try {
      const messageRef = doc(
        db,
        "chats",
        chatId,
        "messages",
        messageId
      );
      await updateDoc(messageRef, {
        text: "This message was deleted",
        imageUrl: null,
        edited: true,
        editedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Failed to delete message");
    }
  }
}
