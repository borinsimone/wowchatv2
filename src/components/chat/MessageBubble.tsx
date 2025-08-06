import React, { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useAppStore } from "../../store/useAppStore";
import { MessageService } from "../../services/messageService";
import styles from "./MessageBubble.module.css";
import type { Message } from "../../types";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isFirstInGroup: boolean;
  chatId: string;
}

export const MessageBubble: React.FC<
  MessageBubbleProps
> = ({
  message,
  isCurrentUser,
  isFirstInGroup,
  chatId,
}) => {
  const { user, contacts } = useAppStore();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(
    message.text || ""
  );

  // Get sender info
  const sender =
    contacts.find(
      (contact) => contact.uid === message.senderId
    ) || user;
  const senderName = isCurrentUser
    ? "Tu"
    : sender?.displayName || "Utente";

  // Format timestamp
  const formatTime = () => {
    if (!message.timestamp) return "";
    const date = message.timestamp.toDate();
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: it,
    });
  };

  // Handle edit message
  const handleEdit = async () => {
    if (!editText.trim() || editText === message.text) {
      setIsEditing(false);
      setEditText(message.text || "");
      return;
    }

    try {
      await MessageService.editMessage(
        chatId,
        message.id,
        editText
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Errore durante la modifica:", error);
    }
  };

  // Handle delete message
  const handleDelete = async () => {
    if (
      confirm(
        "Sei sicuro di voler eliminare questo messaggio?"
      )
    ) {
      try {
        await MessageService.deleteMessage(
          chatId,
          message.id
        );
      } catch (error) {
        console.error(
          "Errore durante l'eliminazione:",
          error
        );
      }
    }
  };

  // Mark as read when message is visible
  React.useEffect(() => {
    if (
      !isCurrentUser &&
      user &&
      !message.readBy.includes(user.uid)
    ) {
      MessageService.markMessageAsRead(
        chatId,
        message.id,
        user.uid
      );
    }
  }, [message, isCurrentUser, user, chatId]);

  const bubbleClass = `${styles.bubble} ${
    isCurrentUser ? styles.currentUser : styles.otherUser
  } ${isFirstInGroup ? styles.firstInGroup : ""}`;

  return (
    <motion.div
      className={styles.messageContainer}
      data-current-user={isCurrentUser}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      {/* Avatar for other users (only first in group) */}
      {!isCurrentUser && isFirstInGroup && (
        <div className={styles.avatar}>
          {sender?.photoURL ? (
            <img src={sender.photoURL} alt={senderName} />
          ) : (
            <div className={styles.avatarFallback}>
              {senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div className={styles.bubbleWrapper}>
        {/* Sender name (only for other users, first in group) */}
        {!isCurrentUser && isFirstInGroup && (
          <div className={styles.senderName}>
            {senderName}
          </div>
        )}

        <div className={bubbleClass}>
          {/* Message content */}
          {isEditing ? (
            <div className={styles.editContainer}>
              <input
                type="text"
                value={editText}
                onChange={(e) =>
                  setEditText(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdit();
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditText(message.text || "");
                  }
                }}
                className={styles.editInput}
                autoFocus
              />
              <div className={styles.editActions}>
                <button
                  onClick={handleEdit}
                  className={styles.editSave}
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.text || "");
                  }}
                  className={styles.editCancel}
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <>
              {message.imageUrl ? (
                <div className={styles.imageContainer}>
                  <img
                    src={message.imageUrl}
                    alt="Immagine condivisa"
                    className={styles.messageImage}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className={styles.messageText}>
                  {message.text}
                  {message.edited && (
                    <span className={styles.editedLabel}>
                      {" "}
                      (modificato)
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {/* Timestamp and read status */}
          <div className={styles.messageInfo}>
            <span className={styles.timestamp}>
              {formatTime()}
            </span>
            {isCurrentUser && (
              <span className={styles.readStatus}>
                {message.readBy.length > 1 ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        </div>

        {/* Message actions */}
        {showActions && isCurrentUser && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={styles.messageActions}
          >
            <button
              onClick={() => setIsEditing(true)}
              className={styles.actionButton}
              title="Modifica messaggio"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className={styles.actionButton}
              title="Elimina messaggio"
            >
              🗑️
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
