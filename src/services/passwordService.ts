// src/services/passwordService.ts
//
// Single swappable data source for password changes. Calls the real backend:
//   - POST /ChangePassword
// Attached with the stored auth token, following the same pattern as
// dashboardService.ts / employeeService.ts.

import { getToken } from "./authService";

export interface ChangePasswordPayload {
  id: string | number;
  old_password: string;
  password: string;
}

export interface ChangePasswordResponse {
  Type: "S" | "E";
  Message: string;
}

// const API_BASE_URL = "https://animal.do365tech.com/admin/api";
// const API_BASE_URL = "/admin/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const API_BASE_URL = "http://192.168.29.62:8000/api";
const CHANGE_PASSWORD_API_URL = `${API_BASE_URL}/ChangePassword`;

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Submit a password change request. Mirrors the /ChangePassword contract
 * used elsewhere: { user_id, old_password, password } -> { Type, Message }.
 */
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  const response = await fetch(CHANGE_PASSWORD_API_URL, {
    method: "PUT",
    // headers: {
    //   ...authHeaders(),
    //   "X-CSRF-TOKEN": "",
    // },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to change password (status ${response.status})`);
  }

  return response.json();
}
