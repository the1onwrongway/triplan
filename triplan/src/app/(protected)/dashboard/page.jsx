"use client"; // REQUIRED at the top of the file

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

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

  // ✅ workflow modal
  const [showWorkflow, setShowWorkflow] = useState(false);

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
          .select("id, agency_name, has_seen_workflow")
          .eq("id", data.session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
        } else {
          setAgencyId(profile.id);
          setAgencyName(profile?.agency_name || "");

          // ✅ Show workflow if first time
          if (!profile.has_seen_workflow) {
            setShowWorkflow(true);
          }

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

  const closeWorkflow = async (dontShowAgain = false) => {
    setShowWorkflow(false);

    if (dontShowAgain && user) {
      await supabase
        .from("profiles")
        .update({ has_seen_workflow: true })
        .eq("id", user.id);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen flex items-start justify-center relative"> 
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Welcome to Dashboard</h1>
          {/* ❓ button to reopen workflow */}
          <button
            onClick={() => setShowWorkflow(true)}
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ?
          </button>
        </div>

        <p className="mb-6 text-gray-700">
          {agencyName
            ? <>You are logged in as <strong>{agencyName}</strong>.</>
            : <>You are logged in as <strong>{user?.email}</strong>.</>}
        </p>

        {/* ✅ Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Clients Card */}
          <button
            onClick={() => router.push("/client")}
            className="bg-gray-100 p-4 rounded-lg text-center shadow hover:bg-gray-200 transition"
          >
            <h2 className="text-xl font-bold">{totalClients}</h2>
            <p className="text-gray-600 text-sm">Total Clients</p>
          </button>

          {/* Vendors Card */}
          <button
            onClick={() => router.push("/vendors")}
            className="bg-gray-100 p-4 rounded-lg text-center shadow hover:bg-gray-200 transition"
          >
            <h2 className="text-xl font-bold">{totalVendors}</h2>
            <p className="text-gray-600 text-sm">Total Vendors</p>
          </button>

          {/* Trips Card */}
          <button
            onClick={() => router.push("/trips")}
            className="bg-gray-100 p-4 rounded-lg text-center shadow hover:bg-gray-200 transition"
          >
            <h2 className="text-xl font-bold">{totalTrips}</h2>
            <p className="text-gray-600 text-sm">Total Trips</p>
          </button>
        </div>
      </div>

      {/* Workflow Walkthrough Overlay */}
      {showWorkflow && (
    <>
      {/* Subtle overlay */}
      <div className="fixed inset-0 bg-gray-900/30 pointer-events-none z-40"></div>

      {/* Walkthrough container */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-6 px-6 py-6 bg-gradient-to-br from-blue-100 via-white to-blue-200 border border-gray-700 rounded-xl">
        
        {/* Steps row */}
        <div className="flex items-center space-x-6 overflow-x-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</div>
            <p className="mt-2 text-black-200 text-center font-medium">Add Client</p>
          </div>

          {/* Arrow */}
          <svg className="w-6 h-6 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Step 2 */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">2</div>
            <p className="mt-2 text-black-200 text-center font-medium">Add vendors</p>
          </div>

          {/* Arrow */}
          <svg className="w-6 h-6 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Step 3 */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">3</div>
            <p className="mt-2 text-black-200 text-center font-medium">Create trips</p>
          </div>

          {/* Arrow */}
          <svg className="w-6 h-6 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Step 4 */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">4</div>
            <p className="mt-2 text-black-200 text-center font-medium">Build Itinerary</p>
          </div>
        </div>

        {/* Buttons row */}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => closeWorkflow(true)}
            className="px-4 py-2 bg-black-200 rounded-lg hover:bg-gray-300 text-gray-800"
          >
            Don’t show again
          </button>
          <button
            onClick={() => closeWorkflow(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Got it
          </button>
        </div>

      </div>
    </>
)}
    </div> 
  );
}
