import { useEffect, useState } from "react";
import { PawPrint, AlertTriangle, Eye } from "lucide-react";
import {
  fetchDashboardAnimalCount,
  type AnimalCount,
  type AnimalListItem,
} from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Base URL where the backend serves uploaded image files.
// NOTE: adjust this to match how your backend actually serves
// "captured_images/..." paths — confirm the correct prefix with your
// backend team (e.g. it might already include "/storage" or similar).
// const IMAGE_BASE_URL = "https://animal.do365tech.com";
// "https://poc-backend.do365tech.com";

// Renders the animal's `image` field either as a base64 payload or as a
// relative file path served by your backend.
// function resolveImageSrc(image: string): string {
//   if (!image) return "";
//   if (image.startsWith("http") || image.startsWith("data:")) return image;
//   // Long strings with no file extension / slashes are almost certainly
//   // raw base64 JPEG data rather than a path.
//   if (!image.includes("/") && image.length > 200) {
//     return `data:image/jpeg;base64,${image}`;
//   }
//   return `${IMAGE_BASE_URL}/${image}`;
// }

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

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<AnimalCount[]>([]);
  const [animalList, setAnimalList] = useState<AnimalListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchDashboardAnimalCount();
        if (active) {
          setCounts(data.animal_count);
          setAnimalList(data.animal_list);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard data.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  function getTodayFormatted(): string {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="bg-blue-800 p-5 text-white flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Welcome back
            {/* <span>👋</span> */}
          </h1>
          <p className="text-blue-300 mt-1">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        {/* <button className="bg-white/10 rounded-xl p-2" aria-label="Calendar">
          <Calendar className="w-5 h-5" />
        </button> */}
      </div>
      <div className="text-black flex items-start justify-start mb-3">
        <h2 className="text-xl font-bold flex items-center">
          {getTodayFormatted()}
        </h2>
        {/* <button className="bg-white/10 rounded-xl p-2" aria-label="Calendar">
          <Calendar className="w-5 h-5" />
        </button> */}
      </div>

      {/* Loading / error states */}
      {isLoading && (
        <p className="text-gray-500 text-center py-8">Loading dashboard...</p>
      )}
      {error && !isLoading && (
        <p className="text-red-500 text-center py-8">{error}</p>
      )}

      {/* Animal count cards — single blue theme throughout */}
      {!isLoading && !error && (
        <>
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
                  {/* <p className="text-gray-500 text-xs mt-1">Count</p> */}
                </div>
              </div>
            ))}
            {counts.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No animal counts to show.
              </p>
            )}
          </div>

          {/* Animal list table */}
          <div className="flex items-center justify-between mt-6 mb-3">
            <h2 className="text-2xl font-bold">Recent Detections</h2>
            <button
              type="button"
              onClick={() => navigate("/reports")}
              className="text-blue-600 text-sm font-semibold"
            >
              View All
            </button>
          </div>
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
                      No detections to show.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
