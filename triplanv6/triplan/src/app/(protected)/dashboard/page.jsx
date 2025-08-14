"use client"; // REQUIRED at the top of the file

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        router.replace("/login");
      } else {
        setUser(data.session.user);
        setLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.replace("/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>
      <p className="mb-6 text-gray-700">
        You are now logged in as <strong>{user?.email}</strong>.
      </p>
    </div>
  );
}