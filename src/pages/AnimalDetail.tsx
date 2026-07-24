// src/pages/AnimalDetail.tsx
//
// Detail page shown when the eye icon is tapped on a detection row in
// Dashboard / Reports. Fetches GET /AnimalFaceAnimalById/{id}.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Camera,
  Hash,
  Calendar,
  Gauge,
} from "lucide-react";
import { fetchAnimalById, type AnimalDetail } from "../services/animalService";

// Renders the `image` field either as a base64 payload or as a relative
// file path served by the backend.
const IMAGE_BASE_URL = "https://poc-backend.do365tech.com";

function resolveImageSrc(image: string): string {
  if (!image) return "";
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  if (!image.includes("/") && image.length > 200) {
    return `data:image/jpeg;base64,${image}`;
  }
  return `${IMAGE_BASE_URL}/${image}`;
}

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

export default function AnimalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState<AnimalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      if (!id) {
        setError("No animal id provided.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchAnimalById(id);
        if (active) setAnimal(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load animal details.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Animal Details</h1>
      </div>

      {isLoading && (
        <p className="text-gray-500 text-center py-8">Loading details...</p>
      )}
      {error && !isLoading && (
        <p className="text-red-500 text-center py-8">{error}</p>
      )}
      {!isLoading && !error && !animal && (
        <p className="text-gray-500 text-center py-8">Animal not found.</p>
      )}

      {!isLoading && !error && animal && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Image */}
          {animal.image ? (
            <img
              src={resolveImageSrc(animal.image)}
              alt={animal.animal_name}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}

          <div className="p-5">
            {/* Name + harmful badge */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold capitalize text-gray-900">
                {animal.animal_name}
              </h2>
              {animal.is_harmful === 1 ? (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">
                  <AlertTriangle className="w-4 h-4" />
                  Harmful
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full">
                  Not Harmful
                </span>
              )}
            </div>

            {/* Detail rows */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Asset No</p>
                  <p className="font-medium text-gray-900">{animal.asset_no}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Camera ID</p>
                  <p className="font-medium text-gray-900">
                    {animal.camera_id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Gauge className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Confidence</p>
                  <p className="font-medium text-gray-900">
                    {(animal.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Captured At</p>
                  <p className="font-medium text-gray-900">
                    {formatCreatedOn(animal.created_on)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
