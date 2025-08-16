"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    getUser();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <div className="text-center p-10">Checking session...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className={`${!sidebarOpen && "hidden"} font-bold text-lg`}>Menu</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} className="text-gray-800" />
          </button>
        </div>
        <nav className="p-2">
          {[
            { name: "Dashboard", path: "/dashboard" },
            { name: "Trips", path: "/trips" },
            { name: "Client", path: "/client" },
            { name: "Vendors", path: "/vendors" },
            { name: "Reports", path: "/reports" },
            { name: "Profile", path: "/profile" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="block px-4 py-2 rounded hover:bg-gray-200"
            >
              {sidebarOpen ? item.name : item.name.charAt(0)}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}