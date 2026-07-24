// src/pages/EmployeeDetail.tsx
//
// Protected page. Reads :id from the URL, looks up the detected-animal
// record via the swappable service, and renders a detail card. Includes a
// "Back to list" button.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { fetchEmployeeById } from "../services/employeeService";
import type { AnimalRecord } from "../services/employeeService";
import logo from '../../public/vite.svg';
// Base URL where the backend serves uploaded image files.
// NOTE: adjust this to match how your backend actually serves
// "captured_images/..." paths — confirm the correct prefix with your
// backend team (e.g. it might already include "/storage" or similar).
// const IMAGE_BASE_URL = "http://localhost:8000";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AnimalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) {
        setError("No record id provided.");
        setLoading(false);
        return;
      }
      try {
        const data = await fetchEmployeeById(id);
        if (!active) return;
        if (!data) setError("Record not found.");
        else setRecord(data);
      } catch {
        if (active) setError("Failed to load record.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="page">
      <Header />
      <main className="page__body">
        <button
          className="btn btn--ghost"
          onClick={() => navigate("/employees")}
        >
          ← Back to list
        </button>

        {loading && <p className="muted">Loading record…</p>}
        {error && <p className="error-text">{error}</p>}

        {record && (
          <div className="detail-card">
            <img
              src={logo}
              alt={record.animal_name}
              className="detail-card__image"
            />
            <h1 className="detail-card__name">{record.animal_name}</h1>
            <p className="detail-card__sub">
              Asset {record.asset_no} ·{" "}
              <span
                className={
                  record.is_harmful
                    ? "badge badge--danger"
                    : "badge badge--safe"
                }
              >
                {record.is_harmful ? "Harmful" : "Safe"}
              </span>
            </p>

            <dl className="detail-grid">
              <div className="detail-grid__item">
                <dt>Animal</dt>
                <dd>{record.animal_name}</dd>
              </div>
              <div className="detail-grid__item">
                <dt>Asset No.</dt>
                <dd className="cell-mono">{record.asset_no}</dd>
              </div>
              <div className="detail-grid__item">
                <dt>Harmful</dt>
                <dd>{record.is_harmful ? "Yes" : "No"}</dd>
              </div>
              <div className="detail-grid__item">
                <dt>Detected On</dt>
                <dd className="cell-mono">{record.created_on}</dd>
              </div>
              <div className="detail-grid__item">
                <dt>Record ID</dt>
                <dd className="cell-mono">{record.id}</dd>
              </div>
            </dl>
          </div>
        )}
      </main>
    </div>
  );
}
