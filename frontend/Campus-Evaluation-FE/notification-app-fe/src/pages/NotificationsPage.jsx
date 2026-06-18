import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";

import { NotificationFilter } from "../components/NotificationFilter";
import { NotificationList } from "../components/NotificationList";
import { useNotifications } from "../hooks/useNotifications";
import { Log } from "../utils/logger";

const LIMIT_OPTIONS = [3, 5, 10];

function filterBySearch(notifications, searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return notifications;
  }

  return notifications.filter((notification) => {
    const searchableText = `${notification.title} ${notification.message} ${notification.notification_type}`.toLowerCase();
    return searchableText.includes(normalizedSearch);
  });
}

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    notifications,
    priorityNotifications,
    total,
    totalPages,
    unreadCount,
    loading,
    error,
    toggleReadStatus,
  } = useNotifications({ filter, page, limit });

  useEffect(() => {
    Log("frontend", "info", "page", "Notification dashboard loaded");
  }, []);

  const visibleNotifications = useMemo(
    () => filterBySearch(notifications, searchTerm),
    [notifications, searchTerm],
  );

  const visiblePriorityNotifications = useMemo(
    () => filterBySearch(priorityNotifications, searchTerm),
    [priorityNotifications, searchTerm],
  );

  const handleFilterChange = (_event, nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
    Log("frontend", "info", "component", `Notification filter changed to ${nextFilter}`);
  };

  const handleLimitChange = (event) => {
    const nextLimit = Number(event.target.value);
    setLimit(nextLimit);
    setPage(1);
    Log("frontend", "info", "component", `Priority notification limit changed to ${nextLimit}`);
  };

  const handlePageChange = (_event, nextPage) => {
    setPage(nextPage);
    Log("frontend", "info", "component", `Notification page changed to ${nextPage}`);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box component="main" sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Badge badgeContent={unreadCount} color="primary" max={99}>
                <NotificationsIcon sx={{ fontSize: 30 }} />
              </Badge>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 28, md: 34 } }}>
                  Notification Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {total} notifications available - {unreadCount} unread
                </Typography>
              </Box>
            </Stack>

            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
              <InputLabel id="priority-limit-label">Priority Limit</InputLabel>
              <Select
                labelId="priority-limit-label"
                value={limit}
                label="Priority Limit"
                onChange={handleLimitChange}
              >
                {LIMIT_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    Top {option} Priority Notifications
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Paper variant="outlined" sx={{ borderRadius: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <NotificationFilter value={filter} onChange={handleFilterChange} />
            </Box>

            <Box sx={{ p: 2 }}>
              <TextField
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
                size="small"
                label="Search notifications"
                placeholder="Search by title, message, or type"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>

          {loading && (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && <Alert severity="error">Failed to load notifications: {error}</Alert>}

          {!loading && !error && (
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { xs: "1fr", md: "minmax(320px, 5fr) minmax(0, 7fr)" },
              }}
            >
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, height: "100%" }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <StarIcon color="warning" />
                    <Typography variant="h6" fontWeight={700}>
                      Priority Inbox
                    </Typography>
                  </Stack>
                  <NotificationList
                    emptyMessage="No priority notifications match your filters."
                    notifications={visiblePriorityNotifications}
                    onToggleRead={toggleReadStatus}
                  />
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={700}>
                    All Notifications
                  </Typography>
                  <NotificationList
                    emptyMessage="No notifications match your filters."
                    notifications={visibleNotifications}
                    onToggleRead={toggleReadStatus}
                  />
                  {totalPages > 1 && (
                    <>
                      <Divider />
                      <Box display="flex" justifyContent="center">
                        <Pagination
                          count={totalPages}
                          page={page}
                          onChange={handlePageChange}
                          color="primary"
                          shape="rounded"
                        />
                      </Box>
                    </>
                  )}
                </Stack>
              </Paper>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
