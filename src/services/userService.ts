import { getToken } from "./authService";
import { API_URL } from "./authService";

const UPDATE_USER_API_URL = `${API_URL}/RefreshOneSignalUpdate`;

export interface UpdateUserResult {
  Type: string;
  Message: string;
}

export async function updateUserOneSignalId(
  userId: string | number,
  onesignalSubscriptionId: string,
  deviceId: string,
): Promise<UpdateUserResult> {
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(UPDATE_USER_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        user_id: userId,
        onesignal_subscription_id: onesignalSubscriptionId,
        device_id: deviceId,
      }),
    });
  } catch (err) {
    throw new Error("Unable to reach the server. Please try again.");
  }

  let data: UpdateUserResult;
  try {
    data = await response.json();
  } catch {
    throw new Error("Unexpected response from the server.");
  }

  if (!response.ok || data?.Type !== "S") {
    throw new Error(data?.Message || "Failed to update notification settings.");
  }

  return data;
}
