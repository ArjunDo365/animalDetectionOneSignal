import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  RotateCcwKey,
  Eye,
  EyeOff,
  ChevronDown,
  BellRing,
  Copy,
  Check,
} from "lucide-react";
import { changePassword } from "../services/passwordService";
import {
  regenerateOneSignalSubscription,
  getOneSignalSubscriptionId,
} from "../services/notificationService";
import { updateUserOneSignalId } from "../services/userService";
import { getDeviceInfo } from "../utils/deviceInfo";

function CopyableRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 mt-1.5">
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 uppercase font-semibold">
          {label}
        </p>
        <p className="text-xs truncate font-mono font-bold">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 p-1.5 rounded-md hover:bg-gray-100"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });
  const [show, setShow] = useState({
    oldPass: false,
    newPass: false,
    confirmPass: false,
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [notifSuccess, setNotifSuccess] = useState("");
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  const [deviceId, setDeviceId] = useState("");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    setDeviceId(getDeviceInfo().device_id);
    setSubscriptionId(getOneSignalSubscriptionId());
  }, []);

  const toggle = (field: keyof typeof show) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const resetForm = () => {
    setFormData({ oldPass: "", newPass: "", confirmPass: "" });
    setShow({ oldPass: false, newPass: false, confirmPass: false });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formData.oldPass) {
      setFormError("Please enter your old password.");
      return;
    }
    if (!formData.newPass) {
      setFormError("Please enter a new password.");
      return;
    }
    if (!formData.confirmPass) {
      setFormError("Please confirm your new password.");
      return;
    }
    if (formData.newPass === formData.oldPass) {
      setFormError("New and old passwords cannot be the same.");
      return;
    }
    if (formData.newPass !== formData.confirmPass) {
      setFormError("New and confirm passwords don't match.");
      return;
    }

    const userId = (user as { id?: string | number } | null)?.id;
    if (!userId) {
      setFormError("Unable to identify the current user.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await changePassword({
        id: userId,
        old_password: formData.oldPass,
        password: formData.newPass,
      });

      if (result.Type === "S") {
        setFormSuccess(result.Message || "Password changed successfully.");
        resetForm();
        setShowPasswordForm(false);
      } else {
        setFormError(result.Message || "Failed to change password.");
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateNotifications = async () => {
    setNotifError("");
    setNotifSuccess("");
    setPermissionBlocked(false);

    const userId = (user as { id?: string | number } | null)?.id;
    if (!userId) {
      setNotifError("Unable to identify the current user.");
      return;
    }

    setIsRegenerating(true);
    try {
      const { subscriptionId: newId, permissionDenied } =
        await regenerateOneSignalSubscription();

      if (permissionDenied) {
        setPermissionBlocked(true);
        return;
      }

      if (!newId) {
        setNotifError(
          "Couldn't get a notification ID. Please try again in a moment.",
        );
        return;
      }

      await updateUserOneSignalId(userId, newId, deviceId);
      setSubscriptionId(newId);
      setNotifSuccess("Notifications re-enabled successfully.");
    } catch (err) {
      setNotifError(
        err instanceof Error
          ? err.message
          : "Failed to update notification settings.",
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const userEmail =
    (user as { email?: string; name?: string } | null)?.email ??
    (user as { email?: string; name?: string } | null)?.name ??
    "—";

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {user && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mt-2 mb-4">
          <p className="text-gray-500 text-sm">Signed in as</p>
          <p className="font-semibold text-lg">{userEmail}</p>

          <div className="mt-2 pt-2 border-t border-gray-100 divide-y divide-gray-100">
            {deviceId && <CopyableRow label="Device ID" value={deviceId} />}
            <CopyableRow
              label="Subscription ID"
              value={subscriptionId ?? "Not available"}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div className="flex items-start gap-3">
          <BellRing className="w-5 h-5 mt-0.5 shrink-0 text-blue-700" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800">Notifications</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Not receiving alerts? Tap below to reconnect notifications for
              this device.
            </p>

            {permissionBlocked && (
              <div className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="font-medium">
                  Notifications are blocked in your browser.
                </p>
                <p className="mt-1">
                  Your browser won't show the permission prompt again
                  automatically once it's been denied. To fix this:
                </p>
                <ol className="list-decimal list-inside mt-1 space-y-0.5">
                  <li>Open your browser's site settings for this app</li>
                  <li>Find "Notifications" and change it to "Allow"</li>
                  <li>Come back here and tap the button below again</li>
                </ol>
              </div>
            )}

            {notifError && !permissionBlocked && (
              <p className="text-red-500 text-sm mt-2">{notifError}</p>
            )}
            {notifSuccess && (
              <p className="text-sm mt-2 text-blue-700">{notifSuccess}</p>
            )}

            <button
              type="button"
              onClick={handleRegenerateNotifications}
              disabled={isRegenerating}
              className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 bg-blue-700 hover:bg-blue-600"
            >
              {isRegenerating ? "Refreshing..." : "Refresh Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password — inline expandable section, no modal (mobile-only app) */}
      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => {
            setShowPasswordForm((prev) => !prev);
            setFormError("");
            setFormSuccess("");
          }}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-800">
            <RotateCcwKey className="w-5 h-5 text-blue-700" />
            Change Password
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              showPasswordForm ? "rotate-180" : ""
            }`}
          />
        </button>

        {showPasswordForm && (
          <form
            onSubmit={handlePasswordSubmit}
            className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={show.oldPass ? "text" : "password"}
                  value={formData.oldPass}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      oldPass: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => toggle("oldPass")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label="Toggle old password visibility"
                >
                  {show.oldPass ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={show.newPass ? "text" : "password"}
                  value={formData.newPass}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPass: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => toggle("newPass")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label="Toggle new password visibility"
                >
                  {show.newPass ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={show.confirmPass ? "text" : "password"}
                  value={formData.confirmPass}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPass: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => toggle("confirmPass")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label="Toggle confirm password visibility"
                >
                  {show.confirmPass ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            {formSuccess && (
              <p className="text-sm text-blue-700">{formSuccess}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowPasswordForm(false);
                  setFormError("");
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-medium disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold py-3 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Log out
      </button>
    </div>
  );
}
