import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { ChatService } from "../../services/chatService";
import LoadingSpinner from "../ui/LoadingSpinner";
import styles from "./ChatList.module.css";

export const ChatList: React.FC = () => {
  const { user, chats } = useAppStore();
  const [isLocalLoading, setIsLocalLoading] =
    useState(false);
  const [isCreatingChat, setIsCreatingChat] =
    useState(false);

  // Funzione per creare una nuova chat
  const createNewChat = async () => {
    if (!user || isCreatingChat) return;

    setIsCreatingChat(true);
    try {
      // Per ora creiamo una chat con un utente fittizio
      // In una vera app, questo aprirebbe una lista di contatti
      const demoUserId = "demo_user_" + Date.now();

      const chatId = await ChatService.createOrGetChat(
        user.uid,
        demoUserId
      );
      console.log("Created new chat:", chatId);

      // Ricarica le chat
      const updatedChats = await ChatService.getUserChats(
        user.uid
      );
      useAppStore.getState().setChats(updatedChats);
    } catch (error) {
      console.error("Error creating new chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Carica le chat dell'utente
  useEffect(() => {
    if (!user) return;

    setIsLocalLoading(true);

    // Use getUserChats instead of listenToUserChats for now
    ChatService.getUserChats(user.uid)
      .then((userChats) => {
        useAppStore.getState().setChats(userChats);
        setIsLocalLoading(false);
      })
      .catch((error) => {
        console.error(
          "ChatList: Error loading chats",
          error
        );
        useAppStore.getState().setChats([]);
        setIsLocalLoading(false);
      });
  }, [user]);

  // Se non c'è un utente, mostra loading
  if (!user) {
    console.log("ChatList: No user, showing loading");
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>Caricamento...</p>
      </div>
    );
  }

  if (isLocalLoading) {
    console.log("ChatList: Local loading, showing spinner");
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>Caricamento chat...</p>
      </div>
    );
  }

  console.log(
    "ChatList: Rendering, chats count:",
    chats.length
  );

  if (chats.length === 0) {
    console.log("ChatList: No chats, showing empty state");
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>💬</div>
        <h3>Nessuna chat</h3>
        <p>Inizia una nuova conversazione!</p>
        <button
          className={styles.newChatButton}
          onClick={createNewChat}
          disabled={isCreatingChat}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "16px",
          }}
        >
          {isCreatingChat ? "Creando..." : "Nuova Chat"}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.chatList}>
      <div className={styles.header}>
        <h2>Chat</h2>
        <button
          className={styles.newChatButton}
          title="Nuova chat"
          onClick={createNewChat}
          disabled={isCreatingChat}
        >
          {isCreatingChat ? "..." : "➕"}
        </button>
      </div>

      <div className={styles.chatItems}>
        {chats.map((chat) => {
          const otherParticipantId =
            chat.participants?.find(
              (id) => id !== user?.uid
            );
          const lastMessageTime =
            chat.lastMessage?.timestamp?.toDate();
          const hasUnreadMessages = false; // TODO: implementare logica unread

          return (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={`/chat/${chat.id}`}
                className={styles.chatItem}
              >
                <div className={styles.chatAvatar}>
                  <div className={styles.avatarFallback}>
                    {otherParticipantId
                      ?.charAt(0)
                      .toUpperCase() || "?"}
                  </div>
                  {hasUnreadMessages && (
                    <div
                      className={styles.unreadIndicator}
                    />
                  )}
                </div>

                <div className={styles.chatInfo}>
                  <div className={styles.chatHeader}>
                    <h4 className={styles.chatName}>
                      Chat{" "}
                      {otherParticipantId
                        ? `con ${otherParticipantId.slice(
                            0,
                            12
                          )}...`
                        : "Privata"}
                    </h4>
                    {lastMessageTime && (
                      <span
                        className={styles.lastMessageTime}
                      >
                        {formatTime(lastMessageTime)}
                      </span>
                    )}
                  </div>

                  <p className={styles.lastMessage}>
                    {chat.lastMessage?.text ||
                      "Nessun messaggio"}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Utility function per formattare il tempo
const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(
    diffMs / (1000 * 60 * 60 * 24)
  );

  if (diffMinutes < 1) return "ora";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}g`;

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
};
