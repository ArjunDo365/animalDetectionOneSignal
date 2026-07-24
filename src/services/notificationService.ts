// src/services/notificationService.ts
//
// Isolated OneSignal initialization and event handling. The React app calls
// `initOneSignal()` once at startup (which also requests notification
// permission early, so a subscription id exists before login) and
// `promptForNotifications()` after a successful login to bind the
// subscription to the logged-in user. Notification-click deep-linking is
// wired up here so the UI components stay declarative.

import OneSignal from "react-onesignal";
import type { NotificationClickEvent } from "react-onesignal";
// import { API_URL } from "./authService";

// Replace with your real OneSignal app id from the OneSignal dashboard.
const ONESIGNAL_APP_ID = "b5ab97ed-319b-4fd6-a750-adbe2d9fa3a2";

// The OneSignal worker lives under /push/onesignal/ so it doesn't clash with
// the PWA's root-scope service worker (vite-plugin-pwa).
const ONESIGNAL_SW_SCOPE = "/push/onesignal/";
const ONESIGNAL_SW_PATH = "push/onesignal/OneSignalSDKWorker.js";

let initialized = false;
let cachedSubscriptionId: string | null = null;

// Optional in-app navigator set by the router layer (App.tsx). When present,
// a notification click routes inside the SPA instead of forcing a reload.
let deepLinkNavigator: ((path: string) => void) | null = null;

/**
 * Register an in-app navigation function. Called once by App.tsx so the
 * notification-click listener can call React Router's `navigate()`.
 */
export function setDeepLinkNavigator(fn: (path: string) => void): void {
  deepLinkNavigator = fn;
}

/**
 * Initialize the OneSignal Web SDK. Call once at app startup (e.g. in main.tsx
 * or the root component), BEFORE the login form is reachable. This registers
 * the OneSignal service worker under its own scope, requests notification
 * permission early (so a subscription id exists by the time the user logs
 * in), and sets up the notification-click listener.
 */
export async function initOneSignal(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      serviceWorkerParam: { scope: ONESIGNAL_SW_SCOPE },
      serviceWorkerPath: ONESIGNAL_SW_PATH,
      // Don't auto-prompt via OneSignal's own slide-down; we control timing.
      autoPrompt: false,
      // Don't auto-register the default root-scope SW; we use our own path.
      autoRegister: false,
      notifyUrl: "https://onesignal.com/api/v1/notification",
      allowLocalhostAsSecureOrigin: true,
    });

    OneSignal.Notifications.addEventListener(
      "click",
      (event: NotificationClickEvent) => {
        const path = extractDeepLinkPath(event);
        if (!path) return;
        // If the app is open, route in-app without a reload.
        if (deepLinkNavigator) {
          deepLinkNavigator(path);
        } else if (typeof window !== "undefined") {
          // App not yet mounted — fall back to a navigation the router will
          // pick up on load (ProtectedRoute handles the auth guard).
          window.location.href = path;
        }
      },
    );

    // Request permission at startup, before login, so the API call in
    // authService.login() has a real onesignal_subscription_id to send.
    // Harmless if the user already granted/denied — it won't re-prompt if
    // already decided.
    await OneSignal.Notifications.requestPermission();
    // Cache the subscription id as soon as it's available, and keep it
    // updated if it changes later (e.g. permission granted after a delay).
    cachedSubscriptionId = OneSignal.User?.PushSubscription?.id ?? null;

    OneSignal.User.PushSubscription.addEventListener("change", (event) => {
      cachedSubscriptionId = event?.current?.id ?? null;
    });
  } catch (err) {
    // OneSignal init can fail on unsupported browsers / without HTTPS; we
    // degrade gracefully — the app still works, just without push.
    console.warn("[OneSignal] initialization failed:", err);
  }
}

/**
 * Prompt the user for notification permission (no-op if already granted),
 * then associate the subscription with the logged-in user so notifications
 * can be targeted to that user (external_id) rather than broadcast. Call
 * this right after a successful login.
 */
export async function promptForNotifications(userId: string): Promise<void> {
  if (!initialized) return;

  try {
    const granted = await OneSignal.Notifications.requestPermission();
    if (!granted) return;

    // Associate the OneSignal subscription with this user so the backend can
    // send to a specific external_id instead of broadcasting.
    await OneSignal.login(userId);
  } catch (err) {
    console.warn("[OneSignal] prompt/login failed:", err);
  }
}

/**
 * Returns the current browser's OneSignal push subscription id, or null if
 * OneSignal hasn't initialized, permission hasn't been granted yet, or the
 * subscription hasn't been created yet. Used by authService.login() to send
 * `onesignal_subscription_id` in the login request body.
 */
/**
 * Returns the current cached OneSignal push subscription id synchronously,
 * or null if not yet available. Prefer `waitForOneSignalSubscriptionId()`
 * before login, since the subscription id can take a moment to populate
 * even after permission is granted.
 */
export function getOneSignalSubscriptionId(): string | null {
  if (!initialized) return null;
  try {
    return cachedSubscriptionId ?? OneSignal.User?.PushSubscription?.id ?? null;
  } catch (err) {
    console.warn("[OneSignal] could not read subscription id:", err);
    return null;
  }
}

/**
 * Polls for the OneSignal subscription id up to `timeoutMs`, in case it
 * hasn't populated yet at the moment of the login call. Returns null if it
 * never becomes available within the timeout (e.g. permission denied).
 */
export async function waitForOneSignalSubscriptionId(
  timeoutMs = 5000,
): Promise<string | null> {
  const existing = getOneSignalSubscriptionId();
  if (existing) return existing;

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const id = getOneSignalSubscriptionId();
    if (id) return id;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return null;
}

/**
 * Pull a deep-link path out of a notification click event. OneSignal may put
 * it in `event.data.url`, the launch URL, or a custom `data` field. We only
 * care about internal paths that start with "/employees".
 */
function extractDeepLinkPath(event: NotificationClickEvent): string | null {
  const candidates: unknown[] = [
    (event as any)?.result?.url,
    (event as any)?.notification?.launchURL,
    (event as any)?.notification?.additionalData?.url,
    (event as any)?.notification?.additionalData?.path,
    (event as any)?.notification?.additionalData?.deeplink,
  ];

  for (const raw of candidates) {
    if (typeof raw !== "string") continue;
    const path = raw.startsWith("http") ? new URL(raw).pathname : raw;
    if (path.startsWith("/employees")) return path;
  }
  return null;
}

const UPDATE_SUBSCRIPTION_API_URL = "https://poc-backend.do365tech.com/api/UpdateSubscription";
// `http://192.168.29.62:8000/api/UpdateSubscription`;
// "http://localhost:8000/api";

/**
 * Waits for the OneSignal subscription id to become available, then reports
 * it to the backend along with the device id and auth token. Call this once,
 * right after a successful login. Safe to fire-and-forget — logs a warning
 * on failure instead of throwing, so it never blocks the login flow.
 */
export async function syncOneSignalSubscription(
  apiToken: string,
  deviceId: string,
): Promise<void> {
  const subscriptionId = await waitForOneSignalSubscriptionId(10000);

  if (!subscriptionId) {
    console.warn(
      "[OneSignal] subscription id never became available; skipping UpdateSubscription call.",
    );
    return;
  }

  try {
    const response = await fetch(UPDATE_SUBSCRIPTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        device_id: deviceId,
        onesignal_subscription_id: subscriptionId,
      }),
    });

    if (!response.ok) {
      console.warn(
        "[OneSignal] UpdateSubscription call failed:",
        response.status,
      );
    }
  } catch (err) {
    console.warn("[OneSignal] UpdateSubscription request error:", err);
  }
}
