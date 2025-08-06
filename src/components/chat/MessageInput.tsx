import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { MessageService } from "../../services/messageService";
import { StorageService } from "../../services/storageService";
import styles from "./MessageInput.module.css";

interface MessageInputProps {
  chatId: string;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  placeholder = "Scrivi un messaggio...",
}) => {
  const { user } = useAppStore();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Send text message
  const sendMessage = async () => {
    if (!message.trim() || !user || !chatId || isLoading)
      return;

    const messageText = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await MessageService.sendMessage(
        chatId,
        user.uid,
        messageText
      );
    } catch (error) {
      console.error(
        "Errore nell'invio del messaggio:",
        error
      );
      setMessage(messageText); // Restore message on error
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!user || !chatId) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Il file è troppo grande. Dimensione massima: 5MB"
      );
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Tipo di file non supportato. Solo immagini JPEG, PNG, GIF, WebP."
      );
      return;
    }

    setIsLoading(true);

    try {
      const imageUrl = await StorageService.uploadImage(
        file,
        "chat-images",
        user.uid
      );
      await MessageService.sendImageMessage(
        chatId,
        user.uid,
        imageUrl
      );
    } catch (error) {
      console.error(
        "Errore nell'upload dell'immagine:",
        error
      );
      alert("Errore nell'upload dell'immagine. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`${styles.messageInputContainer} ${
        isDragOver ? styles.dragOver : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.inputWrapper}>
        {/* File upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={styles.attachButton}
          disabled={isLoading}
          title="Allega immagine"
        >
          📎
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
          style={{ display: "none" }}
        />

        {/* Message textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className={styles.messageTextarea}
          disabled={isLoading}
          rows={1}
        />

        {/* Send button */}
        <motion.button
          onClick={sendMessage}
          disabled={!message.trim() || isLoading}
          className={`${styles.sendButton} ${
            message.trim() ? styles.sendButtonActive : ""
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Invia messaggio"
        >
          {isLoading ? (
            <div className={styles.loadingSpinner}>⏳</div>
          ) : (
            "➤"
          )}
        </motion.button>
      </div>

      {/* Drag overlay */}
      {isDragOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.dragOverlay}
        >
          <div className={styles.dragMessage}>
            <div className={styles.dragIcon}>📁</div>
            <p>Trascina qui la tua immagine</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
