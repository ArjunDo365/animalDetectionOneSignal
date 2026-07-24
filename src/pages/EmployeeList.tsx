// src/pages/EmployeeList.tsx
//
// Protected page. Fetches detected-animal records from the swappable service
// and renders a table; each row's eye icon navigates to /employees/:id.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { fetchEmployees } from "../services/employeeService";
import type { AnimalRecord } from "../services/employeeService";
import logo from '../../public/vite.svg';

// Base URL where the backend serves uploaded image files.
// NOTE: adjust this to match how your backend actually serves
// "captured_images/..." paths — confirm the correct prefix with your
// backend team (e.g. it might already include "/storage" or similar).
// const IMAGE_BASE_URL = "http://localhost:8000";

export default function EmployeeList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AnimalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchEmployees();
        if (active) setRecords(data);
      } catch (err) {
        if (active) setError("Failed to load records.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page">
      <Header />
      <main className="page__body">
        <h1 className="page__title">Detected Animals</h1>

        {loading && <p className="muted">Loading records…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Animal</th>
                  <th>Asset No.</th>
                  <th>Harmful</th>
                  <th>Detected On</th>
                  <th className="col-action" aria-label="view" />
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <img
                        src={logo}
                        alt={rec.animal_name}
                        className="thumb"
                        width={48}
                        height={48}
                      />
                    </td>
                    <td className="cell-strong">{rec.animal_name}</td>
                    <td>{rec.asset_no}</td>
                    <td>
                      <span
                        className={
                          rec.is_harmful
                            ? "badge badge--danger"
                            : "badge badge--safe"
                        }
                      >
                        {rec.is_harmful ? "Harmful" : "Safe"}
                      </span>
                    </td>
                    <td className="cell-mono">{rec.created_on}</td>
                    <td className="col-action">
                      <button
                        className="icon-btn"
                        title={`View ${rec.animal_name}`}
                        aria-label={`View ${rec.animal_name}`}
                        onClick={() => navigate(`/employees/${rec.id}`)}
                      >
                        {/* eye icon */}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
