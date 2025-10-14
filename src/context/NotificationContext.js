import { createContext, useContext, useRef, useState } from "react";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const timerRef = useRef(null);

  const notify = (message, type = "info", duration = 3000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setNotification({ message, type });
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setNotification(null);
        timerRef.current = null;
      }, duration);
    }
  };

  const close = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notify, close }}>
      {children}
      {notification && (
        <div
          className={`toast toast-${notification.type}`}
          onClick={close}
          role="alert"
          aria-live="assertive"
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
