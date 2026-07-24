// src/services/animalService.ts
//
// Single swappable data source for a single detected-animal record. The
// AnimalDetail page imports only from this file. Calls the real backend:
//   - GET /AnimalFaceAnimalById/{id}
// Attached with the stored auth token, following the same pattern as
// dashboardService.ts / employeeService.ts.

import { getToken } from "./authService";

export interface AnimalDetail {
  id: string;
  animal_id: string;
  camera_id: string;
  animal_name: string;
  asset_no: string;
  type: string | null;
  date: string;
  confidence: number;
  is_harmful: number;
  image: string;
  created_on: string;
}

const API_BASE_URL = "https://animal.do365tech.com/admin/api";
const ANIMAL_BY_ID_API_URL = `${API_BASE_URL}/AnimalFaceAnimalById`;

// function authHeaders(): HeadersInit {
//   const token = getToken();
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// }

/**
 * Fetch a single detected-animal record by id. Returns `null` when not
 * found so the page can render a "not found" state without throwing.
 */
export async function fetchAnimalById(
  id: string,
): Promise<AnimalDetail | null> {
  const response = await fetch(`${ANIMAL_BY_ID_API_URL}/${id}`, {
    method: "GET",
    // headers: authHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch animal detail (status ${response.status})`,
    );
  }

  const data = await response.json();
  return data ?? null;
}
