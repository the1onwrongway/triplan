"use client"; // REQUIRED at the top of the file

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [agencyName, setAgencyName] = useState(""); 
  const [agencyId, setAgencyId] = useState(null);

  // ✅ counts
  const [totalClients, setTotalClients] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        router.replace("/login");
      } else {
        setUser(data.session.user);

        // 🔹 Fetch agency_name + id from profiles table
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, agency_name")
          .eq("id", data.session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
        } else {
          setAgencyId(profile.id);
          setAgencyName(profile?.agency_name || "");

          // 🔹 Fetch counts
          fetchCounts(profile.id);
        }

        setLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.replace("/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const fetchCounts = async (agencyId) => {
    try {
      // Clients count
      const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId);

      // Vendors count
      const { count: vendorsCount } = await supabase
        .from("vendors")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId);

      // Trips count
      const { count: tripsCount } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId);

      setTotalClients(clientsCount || 0);
      setTotalVendors(vendorsCount || 0);
      setTotalTrips(tripsCount || 0);
    } catch (err) {
      console.error("Error fetching counts:", err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen flex items-start justify-center"> 
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>
        <p className="mb-6 text-gray-700">
          {agencyName
            ? <>You are logged in as <strong>{agencyName}</strong>.</>
            : <>You are logged in as <strong>{user?.email}</strong>.</>}
        </p>

        {/* ✅ Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg text-center shadow">
            <h2 className="text-xl font-bold">{totalClients}</h2>
            <p className="text-gray-600 text-sm">Total Clients</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center shadow">
            <h2 className="text-xl font-bold">{totalVendors}</h2>
            <p className="text-gray-600 text-sm">Total Vendors</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center shadow">
            <h2 className="text-xl font-bold">{totalTrips}</h2>
            <p className="text-gray-600 text-sm">Total Trips</p>
          </div>
        </div>
      </div>
  </div> 
    );
}