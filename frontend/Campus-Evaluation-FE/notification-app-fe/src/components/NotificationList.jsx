import { Alert, Stack } from "@mui/material";
import { NotificationCard } from "./NotificationCard";

export function NotificationList({ emptyMessage, notifications, onToggleRead }) {
  if (notifications.length === 0) {
    return <Alert severity="info">{emptyMessage}</Alert>;
  }

  return (
    <Stack spacing={1.5}>
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} onToggleRead={onToggleRead} />
      ))}
    </Stack>
  );
}
