import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { SidebarTabs } from "./SidebarTabs";
import { ChatView } from "./ChatView";
import { ResizeHandle } from "./ResizeHandle";
import { useResizable } from "../../hooks/useResizable";
import styles from "./ChatLayout.module.css";

const ChatLayout = () => {
  const location = useLocation();
  const isInChat = location.pathname.startsWith("/chat/");

  // Track window width for responsive behavior
  const [windowWidth, setWindowWidth] = useState(
    window.innerWidth
  );
  const isDesktop = windowWidth >= 640;

  // Calculate max width as 50% of viewport width
  const maxWidth = windowWidth * 0.5;

  const {
    width: sidebarWidth,
    isResizing,
    handleMouseDown,
  } = useResizable({
    initialWidth: 320,
    minWidth: 250,
    maxWidth,
  });

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`${styles.chatLayout} ${
        isResizing ? styles.resizing : ""
      }`}
    >
      <div
        className={`${styles.sidebar} ${
          isInChat ? styles.sidebarHiddenOnMobile : ""
        }`}
        style={{
          width: isDesktop
            ? `${sidebarWidth}px`
            : undefined,
        }}
      >
        <SidebarTabs />
        {isDesktop && (
          <ResizeHandle
            onMouseDown={handleMouseDown}
            isResizing={isResizing}
          />
        )}
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
