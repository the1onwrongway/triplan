"use client";

import Link from "next/link";
import { FaRegCalendarAlt, FaShareAlt, FaChartLine } from "react-icons/fa";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header with CTA buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-16">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
              Triplan 🚀
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-700 leading-snug">
              Run Your Travel Agency Like a Pro
            </h2>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex justify-center lg:justify-end gap-4">
            <a
              href="https://triplan-lite.vercel.app/share_preview?tripId=9dfa80b5-cd54-4621-93cf-f0c8b9e2fcbc"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gray-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-gray-700 transition"
            >
              Check Itinerary
            </a>
            
            <Link
              href="/waitlist"
              className="rounded-full bg-blue-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              Join Waitlist
            </Link>
          </div>
        </div>

        {/* Mobile: Video full width */}
        <div className="mb-12 lg:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-4">
            <div style={{
              position: 'relative', 
              width: '100%', 
              height: 0, 
              paddingTop: '56.25%',
              paddingBottom: 0, 
              overflow: 'hidden',
              borderRadius: '8px'
            }}>
              <iframe 
                loading="lazy" 
                style={{
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%', 
                  top: 0, 
                  left: 0, 
                  border: 'none', 
                  padding: 0,
                  margin: 0
                }}
                src="https://www.canva.com/design/DAGw5U3Xw-4/a_COwmegxQa86q0gKCpwdw/watch?embed" 
                allowFullScreen
                allow="fullscreen"
              />
            </div>
            <div className="mt-2 text-center">
              <a 
                href="https://www.canva.com/design/DAGw5U3Xw-4/a_COwmegxQa86q0gKCpwdw/watch?utm_content=DAGw5U3Xw-4&utm_campaign=designshare&utm_medium=embeds&utm_source=link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
              </a>
            </div>
          </div>
        </div>

        {/* Desktop: Video + Cards side by side */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-8 items-start mb-12">
          {/* Video - takes 3 columns */}
          <div className="col-span-3">
            <div className="bg-white rounded-2xl shadow-2xl p-4">
              <div style={{
                position: 'relative', 
                width: '100%', 
                height: 0, 
                paddingTop: '56.25%',
                paddingBottom: 0, 
                overflow: 'hidden',
                borderRadius: '8px'
              }}>
                <iframe 
                  loading="lazy" 
                  style={{
                    position: 'absolute', 
                    width: '100%', 
                    height: '100%', 
                    top: 0, 
                    left: 0, 
                    border: 'none', 
                    padding: 0,
                    margin: 0
                  }}
                  src="https://www.canva.com/design/DAGw5U3Xw-4/a_COwmegxQa86q0gKCpwdw/watch?embed" 
                  allowFullScreen
                  allow="fullscreen"
                />
              </div>
              <div className="mt-2 text-center">
                <a 
                  href="https://www.canva.com/design/DAGw5U3Xw-4/a_COwmegxQa86q0gKCpwdw/watch?utm_content=DAGw5U3Xw-4&utm_campaign=designshare&utm_medium=embeds&utm_source=link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                </a>
              </div>
            </div>
          </div>

          {/* Cards - takes 2 columns, stacked vertically */}
          <div className="col-span-2 flex flex-col gap-6 h-full">
            {/* Feature cards */}
            <div className="flex flex-col gap-6 flex-1">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition flex-1 flex flex-col justify-center">
                <div className="flex items-center mb-3">
                  <FaRegCalendarAlt className="text-blue-500 text-3xl mr-4 flex-shrink-0" />
                  <h3 className="text-xl font-semibold">Create Itineraries</h3>
                </div>
                <p className="text-gray-600">Build beautiful, detailed trip plans in minutes.</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition flex-1 flex flex-col justify-center">
                <div className="flex items-center mb-3">
                  <FaShareAlt className="text-green-500 text-3xl mr-4 flex-shrink-0" />
                  <h3 className="text-xl font-semibold">Share with Clients</h3>
                </div>
                <p className="text-gray-600">Give your customers premium experiences they'll love.</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition flex-1 flex flex-col justify-center">
                <div className="flex items-center mb-3">
                  <FaChartLine className="text-purple-500 text-3xl mr-4 flex-shrink-0" />
                  <h3 className="text-xl font-semibold">Future CRM</h3>
                </div>
                <p className="text-gray-600">Triplan will evolve into a full-featured CRM for agencies.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Cards below video */}
        <div className="lg:hidden">
          <div className="flex flex-col gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center text-center hover:scale-105 transition">
              <FaRegCalendarAlt className="text-blue-500 text-3xl mb-4 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">Create Itineraries</h3>
                <p className="text-gray-600">Build beautiful, detailed trip plans in minutes.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center text-center hover:scale-105 transition">
              <FaShareAlt className="text-green-500 text-3xl mb-4 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">Share with Clients</h3>
                <p className="text-gray-600">Give your customers premium experiences they'll love.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center text-center hover:scale-105 transition">
              <FaChartLine className="text-purple-500 text-3xl mb-4 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">Future CRM</h3>
                <p className="text-gray-600">Triplan will evolve into a full-featured CRM for agencies.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-center max-w-xl mx-auto">
          Start with itinerary sharing and shape the next-generation travel CRM.
        </p>
      </div>
    </main>
  );
}