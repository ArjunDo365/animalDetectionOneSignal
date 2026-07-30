import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { resetPassword } from "../services/passwordRecoveryService";
import logo from "../../public/assets/images/logo.png";
import loginImage from "../../public/assets/images/loginImage.jpg";

interface LocationState {
  id?: string;
  message?: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const id = state?.id;

  const [tempPassword, setTempPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!id) {
      setError("Missing reset session. Please request a new reset email.");
      return;
    }
    if (!tempPassword || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("New and confirm passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword({
        id,
        temp_password: tempPassword,
        password,
        confirmPassword,
      });

      if (result.Type === "S") {
        setSuccess(result.Message || "Password changed successfully.");
        setTimeout(() => navigate("/", { replace: true }), 1500);
      } else {
        setError(result.Message || "Failed to reset password.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex w-full h-[100dvh] bg-black">
      <div className="absolute inset-0 lg:hidden">
        <img
          src={loginImage}
          alt="Do365 Technologies"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative hidden lg:block lg:w-1/2 h-full">
        <img
          src={loginImage}
          alt="Do365 Technologies"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-black to-transparent" />
      </div>

      <div className="relative z-10 w-full lg:w-1/2 h-full lg:bg-black text-white flex flex-col items-center justify-center p-6 lg:p-8 overflow-y-auto">
        <img
          src={logo}
          alt="Do365 Technologies logo"
          className="w-[140px] mb-6 lg:w-[220px] object-contain"
        />

        <div className="flex flex-col items-center w-full max-w-sm p-4 lg:p-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="self-start flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          <h1 className="text-[22px] font-bold uppercase !leading-snug text-white mb-1 text-center">
            Reset Password
          </h1>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Enter the temporary password we emailed you, along with your new
            password.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 w-full mt-2"
          >
            <div>
              <label
                htmlFor="tempPassword"
                className="text-gray-400 font-bold text-sm"
              >
                Temporary Password
              </label>
              <div className="relative text-white/60 mt-1.5">
                <input
                  id="tempPassword"
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Enter temporary password from email"
                  autoFocus
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-white/5 border border-white/15 ps-10 pe-3 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                />
                <span className="absolute start-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5" />
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-gray-400 font-bold text-sm"
              >
                New Password
              </label>
              <div className="relative text-white/60 mt-1.5">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-white/5 border border-white/15 ps-10 pe-3 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                />
                <span className="absolute start-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5" />
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-gray-400 font-bold text-sm"
              >
                Confirm New Password
              </label>
              <div className="relative text-white/60 mt-1.5">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-white/5 border border-white/15 ps-10 pe-3 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                />
                <span className="absolute start-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5" />
                </span>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            {success && (
              <p className="text-blue-400 text-sm text-center">{success}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold uppercase py-3 shadow-[0_10px_20px_-10px_rgba(67,97,238,0.6)] transition-colors"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
