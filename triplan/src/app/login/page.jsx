"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(""); // for reset
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSignup, setIsSignup] = useState(false);
  const [isReset, setIsReset] = useState(false); // toggle password reset

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) router.replace("/dashboard");
      else setLoading(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) router.replace("/dashboard");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      if (isReset) {
        // Step 1: Request password reset link
        if (!newPassword) {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login`,
          });
          if (error) throw error;
          setInfo("Password reset link sent! Please check your email.");
        } else {
          // Step 2: Update password (after redirect)
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw error;
          setInfo("Password updated successfully! Please log in.");
          setIsReset(false);
        }
      } else if (isSignup) {
        // Signup
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) throw error;
        setInfo("Signup successful! Please confirm your email.");
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session?.user) router.replace("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Checking session...</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isReset ? "Reset Password" : isSignup ? "Sign Up" : "Login"} - Travel Agency
        </h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {info && <p className="text-green-600 text-sm mb-4">{info}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Always ask for email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
          </div>

          {/* Show password only if not resetting */}
          {!isReset && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>
          )}

          {/* New password field when reset session is active */}
          {isReset && newPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className={`w-full rounded-lg px-4 py-2 text-white font-semibold shadow focus:outline-none focus:ring-2 ${
              isSignup
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-300"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
            }`}
          >
            {isReset ? (newPassword ? "Update Password" : "Send Reset Link") : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        {/* Toggle links */}
        <p className="mt-4 text-center text-sm text-gray-600">
          {isReset ? (
            <button
              onClick={() => {
                setIsReset(false);
                setError("");
                setInfo("");
              }}
              className="text-blue-600 font-medium hover:underline"
            >
              Back to Login
            </button>
          ) : (
            <>
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                  setInfo("");
                }}
                className="text-blue-600 font-medium hover:underline"
              >
                {isSignup ? "Log In" : "Sign Up"}
              </button>
              {!isSignup && (
                <>
                  {" | "}
                  <button
                    onClick={() => {
                      setIsReset(true);
                      setError("");
                      setInfo("");
                    }}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Forgot Password?
                  </button>
                </>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
}