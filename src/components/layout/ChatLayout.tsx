import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SidebarTabs } from "./SidebarTabs";
import { ChatView } from "./ChatView";
import styles from "./ChatLayout.module.css";

const ChatLayout = () => {
  const location = useLocation();
  const isInChat = location.pathname.startsWith("/chat/");

  return (
    <div className={styles.chatLayout}>
      <div
        className={`${styles.sidebar} ${
          isInChat ? styles.sidebarHiddenOnMobile : ""
        }`}
      >
        <SidebarTabs />
      </div>

      <div
        className={`${styles.main} ${
          isInChat ? styles.mainFullscreenOnMobile : ""
        }`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <div className={styles.welcome}>
                <div className={styles.welcomeIcon}>💬</div>
                <h1>Benvenuto in WowChat!</h1>
                <p>
                  Seleziona una conversazione dalla sidebar
                  per iniziare a chattare, oppure crea una
                  nuova chat per iniziare una conversazione.
                </p>
              </div>
            }
          />
          <Route
            path="/chat/:chatId"
            element={<ChatView />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default ChatLayout;
