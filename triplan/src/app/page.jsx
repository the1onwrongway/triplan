import Link from "next/link";
import { FaRegCalendarAlt, FaShareAlt, FaChartLine } from "react-icons/fa";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-6 py-16">
      <h1 className="text-6xl font-extrabold text-gray-800 mb-6 text-center">
        Welcome to Triplan 🚀
      </h1>
      <p className="text-xl text-gray-700 mb-12 max-w-2xl text-center">
        The easiest way for travel agencies to create, manage, and share trip itineraries.  
        Join our pilot program and experience hassle-free trip planning.
      </p>

      {/* Features section */}
      <div className="grid md:grid-cols-3 gap-6 mb-12 w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
          <FaRegCalendarAlt className="text-blue-500 text-4xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Create Itineraries</h3>
          <p className="text-gray-600">Build detailed trip plans quickly with our intuitive interface.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
          <FaShareAlt className="text-green-500 text-4xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Share with Clients</h3>
          <p className="text-gray-600">Send interactive itineraries to clients and colleagues instantly.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
          <FaChartLine className="text-purple-500 text-4xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Future CRM</h3>
          <p className="text-gray-600">Our MVP will evolve into a full-featured CRM for agencies.</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/login"
        className="rounded-full bg-green-600 px-8 py-4 text-white text-lg font-semibold shadow-md hover:bg-green-700 transition"
      >
        Join the Pilot
      </Link>

      <p className="mt-12 text-gray-500 text-center max-w-xl">
        Start with itinerary sharing today and be part of shaping the next-generation travel CRM.
      </p>
    </main>
  );
}