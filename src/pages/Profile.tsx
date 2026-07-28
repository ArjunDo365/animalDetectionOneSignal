// src/pages/Profile.tsx

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, RotateCcwKey, Eye, EyeOff, ChevronDown } from "lucide-react";
import { changePassword } from "../services/passwordService";

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

  const toggle = (field: keyof typeof show) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const resetForm = () => {
    setFormData({ oldPass: "", newPass: "", confirmPass: "" });
    setShow({ oldPass: false, newPass: false, confirmPass: false });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
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

    // NOTE: adjust `user?.id` to whatever field actually holds the user id
    // on your AuthContext's `user` object.
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

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {user && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mt-2 mb-4">
          <p className="text-gray-500 text-sm">Signed in as</p>
          <p className="font-semibold text-lg">
            {(user as { email?: string; name?: string }).email ??
              (user as { email?: string; name?: string }).name ??
              "—"}
          </p>
        </div>
      )}

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
            <RotateCcwKey className="w-5 h-5 text-gray-500" />
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
              <p className="text-blue-600 text-sm">{formSuccess}</p>
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
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-60"
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
