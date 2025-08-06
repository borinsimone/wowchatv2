import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Conversation } from "../types";

export class ConversationService {
  // Create or get existing conversation between two users
  static async createOrGetConversation(
    currentUserId: string,
    otherUserId: string
  ): Promise<string> {
    try {
      // Check if conversation already exists
      const conversationsRef = collection(
        db,
        "conversations"
      );
      const q = query(
        conversationsRef,
        where(
          "participants",
          "array-contains",
          currentUserId
        )
      );

      const snapshot = await getDocs(q);
      let existingConversationId: string | null = null;

      // Look for existing conversation with both participants
      snapshot.forEach((doc) => {
        const conversation = doc.data() as Conversation;
        if (
          conversation.participants.includes(otherUserId)
        ) {
          existingConversationId = doc.id;
        }
      });

      // Return existing conversation ID if found
      if (existingConversationId) {
        return existingConversationId;
      }

      // Create new conversation if none exists
      const newConversation: Omit<Conversation, "id"> = {
        participants: [currentUserId, otherUserId],
        lastMessage: {
          text: "",
          senderId: "",
          timestamp: serverTimestamp() as any,
        },
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      const docRef = await addDoc(
        conversationsRef,
        newConversation
      );
      return docRef.id;
    } catch (error) {
      console.error(
        "Error creating/getting conversation:",
        error
      );
      throw new Error("Failed to create conversation");
    }
  }

  // Get conversations for a user
  static async getUserConversations(
    userId: string
  ): Promise<Conversation[]> {
    try {
      const conversationsRef = collection(
        db,
        "conversations"
      );
      const q = query(
        conversationsRef,
        where("participants", "array-contains", userId),
        orderBy("updatedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const conversations: Conversation[] = [];

      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
        } as Conversation);
      });

      return conversations;
    } catch (error) {
      console.error(
        "Error getting user conversations:",
        error
      );
      return [];
    }
  }

  // Listen to user conversations
  static listenToUserConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ) {
    const conversationsRef = collection(
      db,
      "conversations"
    );
    const q = query(
      conversationsRef,
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const conversations: Conversation[] = [];
        snapshot.forEach((doc) => {
          conversations.push({
            id: doc.id,
            ...doc.data(),
          } as Conversation);
        });
        callback(conversations);
      },
      (error) => {
        console.error(
          "Error listening to conversations:",
          error
        );
      }
    );
  }

  // Get conversation by ID
  static async getConversationById(
    conversationId: string
  ): Promise<Conversation | null> {
    try {
      const conversationRef = doc(
        db,
        "conversations",
        conversationId
      );
      const conversationSnap = await getDoc(
        conversationRef
      );

      if (conversationSnap.exists()) {
        return {
          id: conversationSnap.id,
          ...conversationSnap.data(),
        } as Conversation;
      }

      return null;
    } catch (error) {
      console.error("Error getting conversation:", error);
      return null;
    }
  }

  // Add participant to conversation (for group chats - future feature)
  static async addParticipant(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      const conversationRef = doc(
        db,
        "conversations",
        conversationId
      );
      await updateDoc(conversationRef, {
        participants: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding participant:", error);
      throw new Error("Failed to add participant");
    }
  }

  // Get other participant in a conversation
  static getOtherParticipantId(
    conversation: Conversation,
    currentUserId: string
  ): string {
    return (
      conversation.participants.find(
        (id) => id !== currentUserId
      ) || ""
    );
  }

  // Check if user is participant in conversation
  static isParticipant(
    conversation: Conversation,
    userId: string
  ): boolean {
    return conversation.participants.includes(userId);
  }
}
