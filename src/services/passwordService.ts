// src/services/passwordService.ts
//
// Single swappable data source for password changes. Calls the real backend:
//   - POST /ChangePassword
// Attached with the stored auth token, following the same pattern as
// dashboardService.ts / employeeService.ts.

import { getToken } from "./authService";

export interface ChangePasswordPayload {
  user_id: string | number;
  old_password: string;
  password: string;
}

export interface ChangePasswordResponse {
  Type: "S" | "E";
  Message: string;
}

const API_BASE_URL = "https://animal.do365tech.com/admin/api";
const CHANGE_PASSWORD_API_URL = `${API_BASE_URL}/ChangePassword`;

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
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
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to change password (status ${response.status})`);
  }

  return response.json();
}
