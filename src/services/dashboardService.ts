// src/services/dashboardService.ts
//
// Single swappable data source for dashboard summary data. The Dashboard
// page imports only from this file. Calls the real backend:
//   - GET /DashboardAnimalCount
// Attached with the stored auth token.

// import { getToken } from "./authService";

export interface AnimalCount {
  name: string;
  animal_count: number;
}

export interface AnimalListItem {
  animal_id?: string;
  id?: string;
  animal_name: string;
  asset_no: string;
  type: string | null;
  date: string;
  confidence: number;
  is_harmful: number;
  image: string;
  created_on: string;
}

export interface DashboardAnimalCountResponse {
  animal_count: AnimalCount[];
  animal_list: AnimalListItem[];
}

// const API_BASE_URL = "https://poc-backend.do365tech.com/api";
const API_BASE_URL = "https://animal.do365tech.com/admin/api";
const DASHBOARD_ANIMAL_COUNT_API_URL = `${API_BASE_URL}/DashboardAnimalCount/null/null`;

// function authHeaders(): HeadersInit {
//   const token = getToken();
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// }

/**
 * Fetch the animal-count summary and recent animal-list records for the
 * dashboard.
 */
export async function fetchDashboardAnimalCount(): Promise<DashboardAnimalCountResponse> {
  const response = await fetch(DASHBOARD_ANIMAL_COUNT_API_URL, {
    method: "GET",
    // headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch dashboard data (status ${response.status})`,
    );
  }

  const data = await response.json();
  return {
    animal_count: Array.isArray(data?.animal_count) ? data.animal_count : [],
    animal_list: Array.isArray(data?.animal_list) ? data.animal_list : [],
  };
}

const DASHBOARD_ANIMAL_COUNT_RANGE_API_URL = `${API_BASE_URL}/DashboardAnimalCount`;

/**
 * Fetch the animal-count summary and animal-list records for a specific
 * date range: GET /DashboardAnimalCount/{start_date}/{end_date}
 * Dates are expected in "YYYY-MM-DD" format.
 */
export async function fetchDashboardAnimalCountByRange(
  startDate: string,
  endDate: string,
): Promise<DashboardAnimalCountResponse> {
  const response = await fetch(
    `${DASHBOARD_ANIMAL_COUNT_RANGE_API_URL}/${startDate}/${endDate}`,
    {
      method: "GET",
      // headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch report data (status ${response.status})`);
  }

  const data = await response.json();
  return {
    animal_count: Array.isArray(data?.animal_count) ? data.animal_count : [],
    animal_list: Array.isArray(data?.animal_list) ? data.animal_list : [],
  };
}
