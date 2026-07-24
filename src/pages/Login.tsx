import { useState } from "react";
import {  useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  promptForNotifications,
  syncOneSignalSubscription,
} from "../services/notificationService";
import { getToken } from "../services/authService";
import { getDeviceInfo } from "../utils/deviceInfo";
import logo from "../../public/assets/images/logo.png";
import loginImage from "../../public/assets/images/loginImage.jpg";
import { Mail, Lock } from "lucide-react";

// interface LocationState {
//   from?: string;
// }

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation();
  // const from = (location.state as LocationState | null)?.from ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      // AuthContext.login must be async and re-throw on failure (it should
      // NOT swallow the error from authService.login). If this resolves
      // successfully, we treat it as a successful login.
      await login(trimmedEmail, trimmedPassword);

      navigate("/dashboard", { replace: true });

      // Trigger the OneSignal permission prompt right after a successful
      // login (not on initial page load).
      promptForNotifications(trimmedEmail).catch((err) =>
        console.warn("[OneSignal] prompt failed:", err),
      );
      // Report the OneSignal subscription id to the backend once it's ready
      // (it may not exist yet at the moment of login — OneSignal creates it
      // asynchronously). Fire-and-forget so it doesn't block navigation.
      const apiToken = getToken();
      if (apiToken) {
        const { device_id } = getDeviceInfo();
        syncOneSignalSubscription(apiToken, device_id).catch((err) =>
          console.warn("[OneSignal] sync failed:", err),
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex w-full h-[100dvh] bg-black">
      {/* Mobile/tablet background image — hidden on lg since the split-screen takes over */}
      <div className="absolute inset-0 lg:hidden">
        <img
          src={loginImage}
          alt="Do365 Technologies"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Left side image — shown only on laptop (lg) and above */}
      <div className="relative hidden lg:block lg:w-1/2 h-full">
        <img
          src={loginImage}
          alt="Do365 Technologies"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-black to-transparent" />
      </div>

      {/* Right side form — full width on mobile & tablet, half on laptop */}
      <div className="relative z-10 w-full lg:w-1/2 h-full lg:bg-black text-white flex flex-col items-center justify-center p-6 lg:p-8 overflow-y-auto">
        <img
          src={logo}
          alt="Do365 Technologies logo"
          className="w-[140px] mb-6 lg:w-[220px] object-contain"
        />

        <div className="flex flex-col items-center w-full max-w-sm p-4 lg:p-8">
          <h1 className="text-[22px] font-bold uppercase !leading-snug text-white mb-1 text-center">
            Animal Detection
          </h1>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Sign in to continue
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 w-full mt-2"
          >
            <div>
              <label
                htmlFor="email"
                className="text-gray-400 font-bold text-sm"
              >
                Email
              </label>
              <div className="relative text-white/60 mt-1.5">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="Enter your email"
                  autoFocus
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-white/5 border border-white/15 ps-10 pe-3 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                />
                <span className="absolute start-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5" />
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-gray-400 font-bold text-sm"
              >
                Password
              </label>
              <div className="relative text-white/60 mt-1.5">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold uppercase py-3 shadow-[0_10px_20px_-10px_rgba(67,97,238,0.6)] transition-colors"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
