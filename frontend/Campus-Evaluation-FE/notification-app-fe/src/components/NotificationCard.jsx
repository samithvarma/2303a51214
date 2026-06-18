import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const PRIORITY_LABELS = {
  Placement: "High",
  Result: "Medium",
  Event: "Low",
};

const PRIORITY_COLORS = {
  Placement: "error",
  Result: "warning",
  Event: "success",
};

export function NotificationCard({ notification, onToggleRead }) {
  const { id, title, message, notification_type: notificationType, read, timestamp } = notification;
  const formattedDate = timestamp
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(timestamp))
    : "";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1,
        borderColor: read ? "divider" : "primary.main",
        bgcolor: read ? "background.paper" : "primary.50",
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between" }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
            {formattedDate && (
              <Typography variant="caption" color="text.secondary">
                {formattedDate}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip label={notificationType} size="small" variant="outlined" />
            <Chip
              label={`${PRIORITY_LABELS[notificationType] || "Low"} Priority`}
              color={PRIORITY_COLORS[notificationType] || "default"}
              size="small"
            />
            <Chip label={read ? "Read" : "Unread"} color={read ? "default" : "primary"} size="small" />
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>

        <Box>
          <Button size="small" variant={read ? "outlined" : "contained"} onClick={() => onToggleRead(id)}>
            Mark as {read ? "Unread" : "Read"}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
