import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { MessageService } from "../../services/messageService";
import { MessageBubble } from "./MessageBubble";
import LoadingSpinner from "../ui/LoadingSpinner";
import styles from "./MessageList.module.css";
import type { Message } from "../../types";

interface MessageListProps {
  chatId: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  chatId,
}) => {
  const { user, messages, setMessages } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessages = messages[chatId] || [];

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Listen to messages for this chat
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = MessageService.listenToMessages(
      chatId,
      (newMessages: Message[]) => {
        setMessages(chatId, newMessages);
      }
    );

    return () => unsubscribe();
  }, [chatId, setMessages]);

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (chatMessages.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>💬</div>
        <h3>Nessun messaggio ancora</h3>
        <p>
          Inizia la conversazione inviando il primo
          messaggio!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.messageList}>
      <div className={styles.messagesContainer}>
        <AnimatePresence initial={false}>
          {chatMessages.map((message, index) => {
            const isCurrentUser =
              message.senderId === user.uid;
            const previousMessage = chatMessages[index - 1];
            const isFirstInGroup =
              !previousMessage ||
              previousMessage.senderId !==
                message.senderId ||
              message.timestamp?.toMillis() -
                previousMessage.timestamp?.toMillis() >
                300000; // 5 minutes

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
                className={styles.messageWrapper}
              >
                <MessageBubble
                  message={message}
                  isCurrentUser={isCurrentUser}
                  isFirstInGroup={isFirstInGroup}
                  chatId={chatId}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
