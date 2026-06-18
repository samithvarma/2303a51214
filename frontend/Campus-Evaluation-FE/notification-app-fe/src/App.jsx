import { useEffect } from "react";
import { NotificationsPage } from "./pages/NotificationsPage";
import { Log } from "./utils/logger";

export default function App() {
  useEffect(() => {
    Log("frontend", "info", "component", "Application started");
  }, []);

  return <NotificationsPage />;
}
