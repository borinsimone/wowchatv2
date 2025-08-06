import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Chat } from "../types";

export class ChatService {
  // Create or get existing chat between two users
  static async createOrGetChat(
    currentUserId: string,
    otherUserId: string
  ): Promise<string> {
    try {
      // Check in userChats for existing chat between these users
      const userChatsRef = collection(db, "userChats");
      const q = query(
        userChatsRef,
        where("userId", "==", currentUserId)
      );

      const snapshot = await getDocs(q);
      let existingChatId: string | null = null;

      // Look through user's chats to find one with the other user
      for (const userDoc of snapshot.docs) {
        const userChats = userDoc.data();
        for (const [chatId] of Object.entries(userChats)) {
          if (chatId === "userId") continue; // Skip userId field

          // Get chat details to check participants
          const chatRef = doc(db, "chats", chatId);
          const chatDoc = await getDoc(chatRef);
          if (chatDoc.exists()) {
            const chat = chatDoc.data() as Chat;
            if (chat.participants.includes(otherUserId)) {
              existingChatId = chatId;
              break;
            }
          }
        }
        if (existingChatId) break;
      }

      // Return existing chat ID if found
      if (existingChatId) {
        return existingChatId;
      }

      // Create new chat if none exists
      const newChat: Omit<Chat, "id"> = {
        participants: [currentUserId, otherUserId],
        lastMessage: {
          text: "",
          senderId: "",
          timestamp: serverTimestamp() as any,
        },
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      const chatDocRef = await addDoc(
        collection(db, "chats"),
        newChat
      );
      const chatId = chatDocRef.id;

      // Add chat to both users' userChats
      await ChatService.addChatToUserChats(
        currentUserId,
        chatId
      );
      await ChatService.addChatToUserChats(
        otherUserId,
        chatId
      );

      return chatId;
    } catch (error) {
      console.error("Error creating/getting chat:", error);
      throw new Error("Failed to create chat");
    }
  }

  // Add chat to user's userChats collection
  static async addChatToUserChats(
    userId: string,
    chatId: string
  ): Promise<void> {
    try {
      const userChatRef = doc(db, "userChats", userId);
      const userChatDoc = await getDoc(userChatRef);

      if (userChatDoc.exists()) {
        // Update existing document
        await updateDoc(userChatRef, {
          [chatId]: {
            lastSeen: serverTimestamp(),
            isArchived: false,
            isMuted: false,
          },
        });
      } else {
        // Create new document
        await setDoc(userChatRef, {
          userId: userId,
          [chatId]: {
            lastSeen: serverTimestamp(),
            isArchived: false,
            isMuted: false,
          },
        });
      }
    } catch (error) {
      console.error(
        "Error adding chat to userChats:",
        error
      );
      throw new Error("Failed to add chat to user");
    }
  }

  // Get user's chats
  static async getUserChats(
    userId: string
  ): Promise<Chat[]> {
    try {
      const userChatRef = doc(db, "userChats", userId);
      const userChatDoc = await getDoc(userChatRef);

      if (!userChatDoc.exists()) {
        return [];
      }

      const userChatsData = userChatDoc.data();
      const chats: Chat[] = [];

      // Get details for each chat
      for (const [key] of Object.entries(userChatsData)) {
        if (key === "userId") continue; // Skip userId field

        const chatDoc = await getDoc(doc(db, "chats", key));
        if (chatDoc.exists()) {
          chats.push({
            id: chatDoc.id,
            ...chatDoc.data(),
          } as Chat);
        }
      }

      // Sort by updatedAt descending
      return chats.sort(
        (a, b) =>
          b.updatedAt?.toMillis() - a.updatedAt?.toMillis()
      );
    } catch (error) {
      console.error("Error getting user chats:", error);
      return [];
    }
  }

  // Listen to user's chats
  static listenToUserChats(
    userId: string,
    callback: (chats: Chat[]) => void
  ) {
    console.log(
      "ChatService: Setting up listener for user",
      userId
    );

    const userChatRef = doc(db, "userChats", userId);

    return onSnapshot(
      userChatRef,
      async (snapshot) => {
        try {
          console.log("ChatService: Received snapshot", {
            exists: snapshot.exists(),
          });
          if (!snapshot.exists()) {
            console.log(
              "ChatService: No userChats document, creating empty one and returning empty array"
            );
            // Create an empty userChats document for this user
            try {
              await setDoc(userChatRef, {
                userId: userId,
                createdAt: serverTimestamp(),
              });
              console.log(
                "ChatService: Created empty userChats document"
              );
            } catch (error) {
              console.error(
                "ChatService: Error creating userChats document:",
                error
              );
            }
            callback([]);
            return;
          }

          const userChatsData = snapshot.data();
          console.log(
            "ChatService: UserChats data",
            userChatsData
          );
          const chatPromises: Promise<Chat | null>[] = [];

          // Create promises for all chat documents
          for (const [key] of Object.entries(
            userChatsData
          )) {
            if (key === "userId" || key === "createdAt")
              continue; // Skip metadata fields
            console.log(
              "ChatService: Processing chat ID",
              key
            );

            const chatPromise = getDoc(
              doc(db, "chats", key)
            ).then((chatDoc) => {
              if (chatDoc.exists()) {
                console.log(
                  "ChatService: Chat document exists",
                  key
                );
                return {
                  id: chatDoc.id,
                  ...chatDoc.data(),
                } as Chat;
              }
              console.log(
                "ChatService: Chat document does not exist",
                key
              );
              return null;
            });
            chatPromises.push(chatPromise);
          }

          console.log(
            "ChatService: Waiting for chat promises",
            { count: chatPromises.length }
          );
          // Wait for all chat documents
          const chatResults = await Promise.all(
            chatPromises
          );
          const chats = chatResults.filter(
            (chat): chat is Chat => chat !== null
          );

          // Sort by updatedAt descending
          const sortedChats = chats.sort((a, b) => {
            const aTime = a.updatedAt?.toMillis() || 0;
            const bTime = b.updatedAt?.toMillis() || 0;
            return bTime - aTime;
          });

          console.log(
            "ChatService: Calling callback with chats",
            { count: sortedChats.length }
          );
          callback(sortedChats);
        } catch (error) {
          console.error(
            "Error in listenToUserChats callback:",
            error
          );
          callback([]);
        }
      },
      (error) => {
        console.error(
          "Error listening to user chats:",
          error
        );
        callback([]);
      }
    );
  }

  // Get chat by ID
  static async getChatById(
    chatId: string
  ): Promise<Chat | null> {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        return {
          id: chatSnap.id,
          ...chatSnap.data(),
        } as Chat;
      }

      return null;
    } catch (error) {
      console.error("Error getting chat:", error);
      return null;
    }
  }

  // Get other participant in a chat
  static getOtherParticipantId(
    chat: Chat,
    currentUserId: string
  ): string {
    return (
      chat.participants.find(
        (id) => id !== currentUserId
      ) || ""
    );
  }

  // Check if user is participant in chat
  static isParticipant(
    chat: Chat,
    userId: string
  ): boolean {
    return chat.participants.includes(userId);
  }

  // Update user's last seen in a chat
  static async updateLastSeen(
    userId: string,
    chatId: string
  ): Promise<void> {
    try {
      const userChatRef = doc(db, "userChats", userId);
      await updateDoc(userChatRef, {
        [`${chatId}.lastSeen`]: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating last seen:", error);
    }
  }
}
