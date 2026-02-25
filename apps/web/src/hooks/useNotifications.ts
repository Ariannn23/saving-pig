import { useCallback } from "react";

export const useNotifications = () => {
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("Este navegador no soporta notificaciones de escritorio");
      return false;
    }

    if (Notification.permission === "granted") return true;

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }, []);

  const sendNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      new Notification(title, {
        icon: "/pwa-192x192.png",
        ...options,
      });
    },
    [requestPermission],
  );

  return {
    requestPermission,
    sendNotification,
    permission: Notification.permission,
  };
};
