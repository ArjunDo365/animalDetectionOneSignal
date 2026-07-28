import { useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { PawPrint, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchDashboardAnimalCountByRange,
  type AnimalCount,
  type AnimalListItem,
} from "../services/dashboardService";

function formatCreatedOn(createdOn: string): string {
  // Backend sends "YYYY-MM-DD HH:mm:ss" — parse manually since browsers
  // (Safari in particular) don't reliably parse space-separated datetimes.
  const [datePart, timePart] = createdOn.split(" ");
  if (!datePart || !timePart) return createdOn;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute, second ?? 0);

  if (isNaN(date.getTime())) return createdOn;

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate}, ${formattedTime}`;
}

// Defaults: today for end date, 7 days ago for start date — adjust if you'd
// rather default to empty inputs.
function getDefaultDates() {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const toISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    start: toISODate(weekAgo),
    end: toISODate(today),
  };
}

export default function Reports() {
  const navigate = useNavigate();
  const defaults = getDefaultDates();

  const [dateRange, setDateRange] = useState<Date[]>([
    new Date(defaults.start),
    new Date(defaults.end),
  ]);

  // Derived YYYY-MM-DD strings for the API call, kept in sync with dateRange.
  const toISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const startDate = dateRange[0] ? toISODate(dateRange[0]) : "";
  const endDate = dateRange[1] ? toISODate(dateRange[1]) : "";
  const [counts, setCounts] = useState<AnimalCount[]>([]);
  const [animalList, setAnimalList] = useState<AnimalListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError("Please select both a start and end date.");
      return;
    }
    if (startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await fetchDashboardAnimalCountByRange(startDate, endDate);
      setCounts(data.animal_count);
      setAnimalList(data.animal_list);
      setHasSearched(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load report data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      {/* Date range pickers */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mt-2 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Date Range
          </label>
          <Flatpickr
            options={{
              mode: "range",
              dateFormat: "Y-m-d",
              closeOnSelect: false,
              altInput: true,
              altFormat: "j F Y",
            }}
            value={dateRange}
            className="form-input w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            onChange={(selectedDates) => {
              if (selectedDates.length === 2) {
                setDateRange(selectedDates);
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full mt-3 rounded-lg bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-2.5 transition-colors"
        >
          {isLoading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Loading / error states */}
      {isLoading && (
        <p className="text-gray-500 text-center py-8">Loading report...</p>
      )}
      {error && !isLoading && (
        <p className="text-red-500 text-center py-4">{error}</p>
      )}

      {!isLoading && !error && hasSearched && (
        <>
          {/* Selected date range indicator */}
          <p className="text-gray-500 text-sm mb-4">
            Showing results for{" "}
            <span className="font-semibold text-gray-700">
              {new Date(startDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-700">
              {new Date(endDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </p>

          {/* Animal count cards — single blue theme throughout */}
          <div className="space-y-4">
            {counts.map((item) => (
              <div
                key={item.name}
                className="bg-blue-700 rounded-3xl p-5 flex items-center justify-between text-white"
              >
                <div className="flex items-center gap-3">
                  <PawPrint className="w-6 h-6" />
                  <div>
                    <p className="font-bold uppercase text-sm">{item.name}</p>
                    <p className="text-blue-200 text-sm">Total Detected</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl px-4 py-2 text-center min-w-[64px]">
                  <p className="text-blue-700 font-bold text-lg leading-none">
                    {item.animal_count}
                  </p>
                </div>
              </div>
            ))}
            {counts.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No animal counts for this range.
              </p>
            )}
          </div>

          {/* Animal list table */}
          <h2 className="text-2xl font-bold mt-6 mb-3">Detections</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold">Animal</th>
                  <th className="px-4 py-3 font-semibold text-center w-20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {animalList.map((item, idx) => (
                  <tr
                    key={`${item.asset_no}-${item.created_on}-${idx}`}
                    className="border-t border-gray-100"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold capitalize text-gray-900">
                        {item.animal_name}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {item.asset_no}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {formatCreatedOn(item.created_on)}
                      </p>
                      <p
                        className={`text-xs font-medium mt-0.5 ${
                          item.is_harmful === 1
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {item.is_harmful === 1 ? "Harmful" : "Not Harmful"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/animals/${item.id}`)}
                        className="inline-flex items-center justify-center !p-0 w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500"
                        aria-label={`View ${item.animal_name}`}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {animalList.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No detections for this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!hasSearched && !isLoading && !error && (
        <p className="text-gray-500 text-center py-8">
          Select a date range and tap Search to view the report.
        </p>
      )}
    </div>
  );
}
