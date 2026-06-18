const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

const ALLOWED_STACKS = ["frontend"];
const ALLOWED_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const ALLOWED_PACKAGES = ["api", "component", "hook", "page", "state"];

function getStoredToken(storageKey) {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window[storageKey]?.getItem("log_api_token") || "";
  } catch {
    return "";
  }
}

function getAuthToken() {
  return (
    import.meta.env.VITE_LOG_API_TOKEN ||
    getStoredToken("localStorage") ||
    getStoredToken("sessionStorage")
  );
}

function validateLogPayload(stack, level, packageName, message) {
  if (!ALLOWED_STACKS.includes(stack)) {
    return `Invalid stack "${stack}". Allowed stack: ${ALLOWED_STACKS.join(", ")}.`;
  }

  if (!ALLOWED_LEVELS.includes(level)) {
    return `Invalid level "${level}". Allowed levels: ${ALLOWED_LEVELS.join(", ")}.`;
  }

  if (!ALLOWED_PACKAGES.includes(packageName)) {
    return `Invalid package "${packageName}". Allowed packages: ${ALLOWED_PACKAGES.join(", ")}.`;
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return "Log message must be a non-empty string.";
  }

  return null;
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return await response.text();
  } catch {
    return null;
  }
}

export async function Log(stack, level, packageName, message) {
  const validationError = validateLogPayload(stack, level, packageName, message);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const token = getAuthToken();

  if (!token) {
    return { success: false, error: "Missing logger authorization token." };
  }

  const payload = {
    stack,
    level,
    package: packageName,
    message: message.trim(),
  };

  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      const error = `Log API request failed with status ${response.status}.`;
      return { success: false, error, status: response.status, data };
    }

    return { success: true, status: response.status, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown logger error.",
    };
  }
}

export default Log;
