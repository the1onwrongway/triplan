import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Welcome to Triplan 🚀</h1>
      <p className="text-lg text-gray-600">Plan and share trips effortlessly.</p>

      <Link
        href="/login"
        className="rounded-2xl bg-blue-600 px-6 py-3 text-white text-lg font-semibold shadow-md hover:bg-blue-700 transition"
      >
        Login
      </Link>
    </main>
  );
}