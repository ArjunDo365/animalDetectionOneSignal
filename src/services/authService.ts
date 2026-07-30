// src/services/authService.ts
//
// Real auth — calls the backend UserLogin API with the required device +
// OneSignal metadata, and stores the returned token + user info in
// localStorage so protected routes can check it on reload.

import { getDeviceInfo } from "../utils/deviceInfo";
import { waitForOneSignalSubscriptionId } from "./notificationService";

const TOKEN_KEY = "pwa_auth_token";
const USER_KEY = "pwa_auth_user";

// export const API_URL = "https://poc-backend.do365tech.com/api";
// export const API_URL = "https://animal.do365tech.com/admin/api";
// export const API_URL = "/admin/api";
export const API_URL = import.meta.env.VITE_API_BASE_URL;
// const API_URL = "http://192.168.29.62:8000/api";
// "http://192.168.29.62:8000/api";
const LOGIN_API_URL = `${API_URL}/UserLogin`;
// "http://192.168.29.62:8000/api/UserLogin";

export class AuthError extends Error {}

interface LoginApiUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  api_token: string;
  user_role?: {
    name?: string;
    landing_page?: string;
  };
}

interface LoginApiResponse {
  Type: string; // "S" = success, anything else = failure
  Message: string;
  AdditionalData?: {
    User?: LoginApiUser;
  };
}

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export async function login(email: string, password: string): Promise<string> {
  const deviceInfo = getDeviceInfo();
  const onesignalSubscriptionId = await waitForOneSignalSubscriptionId();

  let response: Response;

  try {
    response = await fetch(LOGIN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        device_id: deviceInfo.device_id,
        system_name: deviceInfo.system_name,
        system_version: deviceInfo.system_version,
        model_number: deviceInfo.model_number,
        app_version: deviceInfo.app_version,
        onesignal_subscription_id: onesignalSubscriptionId,
      }),
    });
  } catch (err) {
    throw new AuthError("Unable to reach the server. Please try again.");
  }

  let data: LoginApiResponse;
  try {
    data = await response.json();
  } catch {
    throw new AuthError("Unexpected response from the server.");
  }

  // This API returns Type: "S" for success even on a 200 response, and can
  // also return non-2xx statuses on failure — check both.
  if (!response.ok || data?.Type !== "S") {
    throw new AuthError(data?.Message || "Invalid email or password.");
  }

  const user = data?.AdditionalData?.User;
  const token = user?.api_token;

  if (!token || !user) {
    throw new AuthError(
      "Login succeeded but no token was returned by the server.",
    );
  }

  const currentUser: CurrentUser = {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.user_role?.name,
  };

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  return token;
}

const LOGOUT_API_URL = `${API_URL}/UserLogout`;

export async function logout(): Promise<void> {
  const token = getToken();
  const user = getCurrentUser();
  const deviceInfo = getDeviceInfo();

  // Best-effort call — even if this fails, we still clear local session data
  // below so the user is logged out of the app regardless.
  if (token && user) {
    try {
      await fetch(LOGOUT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          device_id: deviceInfo.device_id,
        }),
      });
    } catch (err) {
      console.warn("[Auth] logout API call failed:", err);
    }
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}
