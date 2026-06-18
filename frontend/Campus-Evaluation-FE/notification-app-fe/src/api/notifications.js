import { Log } from "../utils/logger";

const NOTIFICATION_API_URL = import.meta.env.VITE_NOTIFICATION_API_URL || "";
const NOTIFICATION_API_TOKEN = import.meta.env.VITE_NOTIFICATION_API_TOKEN || "";

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    title: "Placement drive scheduled",
    message: "A new campus placement drive has been scheduled for eligible students.",
    notification_type: "Placement",
    timestamp: "2026-06-18T09:00:00.000Z",
  },
  {
    id: 2,
    title: "Semester results published",
    message: "Latest semester results are now available in the student portal.",
    notification_type: "Result",
    timestamp: "2026-06-17T12:30:00.000Z",
  },
  {
    id: 3,
    title: "Technical event reminder",
    message: "Register for the upcoming technical symposium before the deadline.",
    notification_type: "Event",
    timestamp: "2026-06-16T15:45:00.000Z",
  },
  {
    id: 4,
    title: "Placement eligibility update",
    message: "Eligibility lists for the next recruitment cycle have been updated.",
    notification_type: "Placement",
    timestamp: "2026-06-18T11:15:00.000Z",
  },
  {
    id: 5,
    title: "Event registration closing",
    message: "Registration for the coding challenge closes tonight.",
    notification_type: "Event",
    timestamp: "2026-06-18T07:45:00.000Z",
  },
];

function getStoredToken(storageKey) {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window[storageKey]?.getItem("notification_api_token") || "";
  } catch {
    return "";
  }
}

function getNotificationApiToken() {
  return (
    NOTIFICATION_API_TOKEN ||
    getStoredToken("localStorage") ||
    getStoredToken("sessionStorage")
  );
}

function normalizeNotification(notification, index) {
  const type = notification.notification_type || notification.type || "Event";
  const timestamp = notification.timestamp || notification.createdAt || notification.created_at || new Date().toISOString();

  return {
    id: notification.id ?? notification.notification_id ?? `${type}-${timestamp}-${index}`,
    title: notification.title || notification.subject || `${type} notification`,
    message: notification.message || notification.description || notification.body || "No notification details available.",
    notification_type: type,
    timestamp,
  };
}

function applyLocalQuery(notifications, { limit, page, notificationType }) {
  const filteredNotifications = notificationType && notificationType !== "All"
    ? notifications.filter((notification) => notification.notification_type === notificationType)
    : notifications;

  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const start = (safePage - 1) * safeLimit;

  return {
    notifications: filteredNotifications.slice(start, start + safeLimit),
    total: filteredNotifications.length,
  };
}

function buildNotificationsUrl({ limit, page, notificationType }) {
  const url = new URL(NOTIFICATION_API_URL);

  if (limit) {
    url.searchParams.set("limit", String(limit));
  }

  if (page) {
    url.searchParams.set("page", String(page));
  }

  if (notificationType && notificationType !== "All") {
    url.searchParams.set("notification_type", notificationType);
  }

  return url.toString();
}

export async function fetchNotifications({ limit = 10, page = 1, notificationType = "All" } = {}) {
  await Log("frontend", "info", "api", `Requesting notifications: type=${notificationType}, limit=${limit}, page=${page}`);

  if (!NOTIFICATION_API_URL) {
    const localResult = applyLocalQuery(DEFAULT_NOTIFICATIONS.map(normalizeNotification), {
      limit,
      page,
      notificationType,
    });

    await Log("frontend", "info", "api", `Loaded ${localResult.notifications.length} local notifications`);
    return localResult;
  }

  try {
    const token = getNotificationApiToken();
    const response = await fetch(buildNotificationsUrl({ limit, page, notificationType }), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Notification API failed with status ${response.status}`);
    }

    const sourceNotifications = Array.isArray(data.notifications)
      ? data.notifications
      : Array.isArray(data)
        ? data
        : [];

    const notifications = sourceNotifications.map(normalizeNotification);
    const total = Number(data.total) || notifications.length;

    await Log("frontend", "info", "api", `Notification API returned ${notifications.length} notifications`);
    return { notifications, total };
  } catch (error) {
    await Log(
      "frontend",
      "error",
      "api",
      `Notification API error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    throw error;
  }
}
