import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchNotifications } from "../api/notifications";
import { Log } from "../utils/logger";

const PRIORITY_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function sortByPriorityAndTimestamp(firstNotification, secondNotification) {
  const firstPriority = PRIORITY_WEIGHT[firstNotification.notification_type] || 0;
  const secondPriority = PRIORITY_WEIGHT[secondNotification.notification_type] || 0;

  if (firstPriority !== secondPriority) {
    return secondPriority - firstPriority;
  }

  return new Date(secondNotification.timestamp).getTime() - new Date(firstNotification.timestamp).getTime();
}

export function useNotifications({ filter, page, limit }) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readIds, setReadIds] = useState(() => new Set());

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchNotifications({
          limit,
          page,
          notificationType: filter,
        });

        if (isMounted) {
          setNotifications(data.notifications);
          setTotal(data.total);
          await Log("frontend", "info", "hook", `Notifications state updated with ${data.notifications.length} items`);
        }
      } catch (loadError) {
        if (isMounted) {
          const errorMessage = loadError instanceof Error ? loadError.message : "Unable to load notifications.";
          setNotifications([]);
          setTotal(0);
          setError(errorMessage);
          await Log("frontend", "error", "hook", `Notification load failed: ${errorMessage}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [filter, limit, page]);

  const notificationsWithReadState = useMemo(
    () => notifications.map((notification) => ({ ...notification, read: readIds.has(notification.id) })),
    [notifications, readIds],
  );

  const priorityNotifications = useMemo(
    () => [...notificationsWithReadState].sort(sortByPriorityAndTimestamp).slice(0, limit),
    [limit, notificationsWithReadState],
  );

  const toggleReadStatus = useCallback((notificationId) => {
    let nextStatus = "read";

    setReadIds((currentReadIds) => {
      const nextReadIds = new Set(currentReadIds);
      const isCurrentlyRead = nextReadIds.has(notificationId);
      nextStatus = isCurrentlyRead ? "unread" : "read";

      if (isCurrentlyRead) {
        nextReadIds.delete(notificationId);
      } else {
        nextReadIds.add(notificationId);
      }

      return nextReadIds;
    });

    Log("frontend", "info", "state", `Notification ${notificationId} marked as ${nextStatus}`);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const unreadCount = notificationsWithReadState.filter((notification) => !notification.read).length;

  return {
    notifications: notificationsWithReadState,
    priorityNotifications,
    total,
    totalPages,
    unreadCount,
    loading,
    error,
    toggleReadStatus,
  };
}
