import Link from "next/link";
import { FaRegCalendarAlt, FaShareAlt, FaChartLine } from "react-icons/fa";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      {/* Main content */}
      <h1 className="text-6xl font-extrabold text-gray-900 mb-4 text-center">
        Triplan 🚀
      </h1>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-10 text-center leading-snug">
        Run Your Travel Agency Like a Pro
      </h2>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12 w-full max-w-5xl z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
          <FaRegCalendarAlt className="text-blue-500 text-4xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Create Itineraries</h3>
          <p className="text-gray-600">Build beautiful, detailed trip plans in minutes.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
          <FaShareAlt className="text-green-500 text-4xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Share with Clients</h3>
          <p className="text-gray-600">Give your customers premium experiences they'll love.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
          <FaChartLine className="text-purple-500 text-4xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Future CRM</h3>
          <p className="text-gray-600">Triplan will evolve into a full-featured CRM for agencies.</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/waitlist"
        className="rounded-full bg-blue-600 px-10 py-4 text-white text-lg font-semibold shadow-lg hover:bg-blue-700 transition z-10"
      >
        Join the Waitlist
      </Link>

      <p className="mt-12 text-gray-600 text-center max-w-xl z-10">
        Start with itinerary sharing today and help shape the next-generation travel CRM.
      </p>
    </main>
  );
}