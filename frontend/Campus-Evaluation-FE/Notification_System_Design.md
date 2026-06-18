# Notification System Design

## Repository Layout

The submission is contained in the `2303a51214` repository.

- `frontend/Campus-Evaluation-FE/logging-middleware`: logging middleware documentation and evaluation placeholder.
- `frontend/Campus-Evaluation-FE/notification-app-be`: backend placeholder folder retained for the required project structure.
- `frontend/Campus-Evaluation-FE/notification-app-fe`: React Vite frontend implementation.

## Frontend Architecture

The notification frontend is a React Vite application built with Material UI.

- `src/api/notifications.js`: notification API integration with bearer-token support, query parameters, response normalization, and logging.
- `src/utils/logger.js`: reusable logging middleware function `Log(stack, level, packageName, message)`.
- `src/hooks/useNotifications.js`: data loading, frontend read/unread state, priority sorting, pagination state, and error handling.
- `src/pages/NotificationsPage.jsx`: dashboard composition, search, filter tabs, priority inbox, all notifications, loading/error/empty states.
- `src/components/*`: reusable Material UI notification components.

## Logging Strategy

The frontend uses the reusable logging middleware for:

- Application and page load events.
- Notification API requests.
- Notification API responses.
- API and state errors.
- Notification type filter changes.
- Pagination and priority-limit changes.
- Read/unread state changes.

Allowed frontend logging packages are respected: `api`, `component`, `hook`, `page`, and `state`.

## Notification API Integration

The notification API helper supports the required query parameters:

- `limit`
- `page`
- `notification_type`

Bearer-token authentication is supported through `VITE_NOTIFICATION_API_TOKEN`, `localStorage.notification_api_token`, or `sessionStorage.notification_api_token`.

The API base URL is read from `VITE_NOTIFICATION_API_URL`. If no URL is configured, the frontend uses local fallback notification data so the dashboard remains usable during local validation.

## Stage 1 Coverage

- Logging middleware exists and is exported from `src/utils/logger.js`.
- Logger posts to the Affordmed evaluation logging endpoint.
- Logger validates stack, level, package, and message inputs.
- Logger handles missing tokens, failed responses, and network failures gracefully.
- The frontend builds and runs with Vite.

## Stage 2 Coverage

- Notification Dashboard.
- Priority Inbox.
- Filter tabs for `All`, `Placement`, `Result`, and `Event`.
- Top N priority notification selector.
- Search by notification title, message, or type.
- Read/unread badge and frontend-only read state.
- Pagination.
- Loading state.
- Error state.
- Empty state.
- Responsive desktop and mobile Material UI layout.

## Priority Rules

Notifications are sorted by:

1. Priority descending:
   - `Placement = 3`
   - `Result = 2`
   - `Event = 1`
2. Timestamp descending.

## Local Run

The Vite dev server is configured to run exclusively on:

```text
http://127.0.0.1:3000/
```

Validation commands:

```bash
npm install
npm run dev
npm run build
npm run lint
```
