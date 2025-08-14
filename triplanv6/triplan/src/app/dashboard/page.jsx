"use client";
import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import app from "@/lib/firebase";

export default function Dashboard() {
  const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login"); // redirect if not logged in
      } else {
        setUser(firebaseUser);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}</h1>
        <p className="mb-6 text-gray-700">
          You are now logged in to your dashboard.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}