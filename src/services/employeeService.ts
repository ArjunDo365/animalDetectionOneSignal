// src/services/employeeService.ts
//
// Single swappable data source for detected-animal data. The UI components
// import only from this file. Calls the real backend:
//   - list:   GET /LiveAttendanceList
//   - detail: GET /api/DetectedAnimalData/{id}
// Both are attached with the stored auth token.

import { getToken } from "./authService";

export interface AnimalRecord {
  id: string;
  created_on: string;
  is_harmful: number;
  animal_name: string;
  asset_no: string;
  image: string;
}
//https://animal.do365tech.com/admin/api/LiveAttendanceList
// const API_BASE_URL = "http://192.168.29.62:8000/api";
const API_BASE_URL = "https://poc-backend.do365tech.com/api";
const LIST_API_URL = `${API_BASE_URL}/LiveAttendanceList`;
const DETAIL_API_URL = `${API_BASE_URL}/DetectedAnimalData`;

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch the full list of detected animal records.
 */
export async function fetchEmployees(): Promise<AnimalRecord[]> {
  const response = await fetch(LIST_API_URL, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch list (status ${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch a single detected animal record by id. Returns `null` when not found
 * so callers can render a "not found" state without throwing.
 */
export async function fetchEmployeeById(
  id: string,
): Promise<AnimalRecord | null> {
  const response = await fetch(`${DETAIL_API_URL}/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch detail (status ${response.status})`);
  }

  const data = await response.json();
  return data ?? null;
}
