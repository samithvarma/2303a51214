import { Tab, Tabs } from "@mui/material";

const filters = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="scrollable"
      scrollButtons="auto"
      aria-label="Notification type filters"
    >
      {filters.map((type) => (
        <Tab key={type} value={type} label={type} sx={{ textTransform: "none" }} />
      ))}
    </Tabs>
  );
}
