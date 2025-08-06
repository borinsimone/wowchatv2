import React from "react";
import {
  useParams,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { MessageList, MessageInput } from "../chat";
import styles from "./ChatView.module.css";

interface ChatViewProps {
  // Per future implementazioni se necessario
}

export const ChatView: React.FC<ChatViewProps> = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user, chats } = useAppStore();
  const navigate = useNavigate();

  // Se non c'è chatId o utente, redirect
  if (!chatId || !user) {
    return <Navigate to="/" replace />;
  }

  // Trova la chat corrente
  const currentChat = chats.find(
    (chat) => chat.id === chatId
  );

  if (!currentChat) {
    return (
      <div className={styles.chatNotFound}>
        <div className={styles.errorIcon}>😕</div>
        <h3>Chat non trovata</h3>
        <p>
          La chat che stai cercando non esiste o non hai i
          permessi per accedervi.
        </p>
      </div>
    );
  }

  // Ottieni info sull'altro partecipante
  const otherParticipantId = currentChat.participants.find(
    (id) => id !== user.uid
  );

  return (
    <div className={styles.chatView}>
      {/* Header della chat */}
      <div className={styles.chatHeader}>
        {/* Pulsante indietro per mobile */}
        <button
          className={styles.backButton}
          onClick={() => navigate("/")}
          title="Torna alla lista chat"
        >
          ←
        </button>

        <div className={styles.participantInfo}>
          <div className={styles.participantAvatar}>👤</div>
          <div className={styles.participantDetails}>
            <h3>
              Chat{" "}
              {otherParticipantId
                ? `con ${otherParticipantId.slice(0, 8)}...`
                : "Privata"}
            </h3>
            <span className={styles.participantStatus}>
              Online
            </span>
          </div>
        </div>

        <div className={styles.chatActions}>
          <button
            className={styles.actionButton}
            title="Informazioni chat"
          >
            ℹ️
          </button>
          <button
            className={styles.actionButton}
            title="Chiamata"
          >
            📞
          </button>
          <button
            className={styles.actionButton}
            title="Menu"
          >
            ⋮
          </button>
        </div>
      </div>

      {/* Lista messaggi */}
      <MessageList chatId={chatId} />

      {/* Input per nuovi messaggi */}
      <MessageInput chatId={chatId} />
    </div>
  );
};
