"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Menu, 
  LogOut,
  LayoutDashboard, 
  Briefcase, 
  Map, 
  Users, 
  Store, 
  BarChart3, 
  User 
} from "lucide-react";
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

  // Sidebar menu items with icons
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Trips", path: "/trips", icon: <Briefcase size={20} /> },
    { name: "Itinerary", path: "/itinerary", icon: <Map size={20} /> }, // ✅ NEW PAGE
    { name: "Client", path: "/client", icon: <Users size={20} /> },
    { name: "Vendors", path: "/vendors", icon: <Store size={20} /> },
    { name: "Reports", path: "/reports", icon: <BarChart3 size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
  ];

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
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-200"
            >
              {item.icon}
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            <LogOut size={18} /> {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}