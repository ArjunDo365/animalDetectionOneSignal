import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { forgetPassword } from "../services/passwordRecoveryService";
import logo from "../../public/assets/images/logo.png";
import loginImage from "../../public/assets/images/loginImage.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await forgetPassword({ email: trimmedEmail });

      if (result.Type === "S" && result.Id) {
        navigate("/reset-password", {
          state: { id: result.Id, message: result.Message },
        });
      } else {
        setError(result.Message || "Failed to send reset email.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email.",
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
            Forgot Password
          </h1>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Enter your email and we'll send you a temporary password.
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

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold uppercase py-3 shadow-[0_10px_20px_-10px_rgba(67,97,238,0.6)] transition-colors"
            >
              {isSubmitting ? "Sending..." : "Send Reset Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
