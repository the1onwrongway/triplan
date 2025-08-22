"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSignup, setIsSignup] = useState(false); // toggle login/signup

  useEffect(() => {
    // 1️⃣ Check existing session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) router.replace("/dashboard");
      else setLoading(false);
    };

    checkSession();

    // 2️⃣ Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) router.replace("/dashboard");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (isSignup) {
      // 3️⃣ Signup with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`, // redirect to this page after confirmation
        },
      });

      if (error) setError(error.message);
      else setInfo(
        "Signup successful! Please check your email and click the confirmation link before logging in."
      );
    } else {
      // 4️⃣ Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.session?.user) {
        router.replace("/dashboard");
      } else {
        // Email not confirmed yet
        setError("Email not confirmed. Please check your email.");
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Checking session...</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isSignup ? "Sign Up" : "Login"} - Travel Agency
        </h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {info && <p className="text-green-600 text-sm mb-4">{info}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            className={`w-full rounded-lg px-4 py-2 text-white font-semibold shadow focus:outline-none focus:ring-2 ${
              isSignup
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-300"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
            }`}
          >
            {isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
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
        </p>
      </div>
    </div>
  );
}