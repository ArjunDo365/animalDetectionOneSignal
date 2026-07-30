export interface ForgetPasswordPayload {
  email: string;
}

export interface ForgetPasswordResponse {
  Type: "S" | "E";
  Message: string;
  Id?: string;
}

export interface ResetPasswordPayload {
  id: string | number;
  temp_password: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  Type: "S" | "E";
  Message: string;
}

// const API_BASE_URL = "/admin/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FORGET_PASSWORD_API_URL = `${API_BASE_URL}/ForgetPassword`;
const RESET_PASSWORD_API_URL = `${API_BASE_URL}/ResetPassword`;

function jsonHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function forgetPassword(
  payload: ForgetPasswordPayload,
): Promise<ForgetPasswordResponse> {
  const response = await fetch(FORGET_PASSWORD_API_URL, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to request password reset (status ${response.status})`,
    );
  }

  return response.json();
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> {
  const response = await fetch(RESET_PASSWORD_API_URL, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to reset password (status ${response.status})`);
  }

  return response.json();
}
