"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    agency: "",
    trips_per_month: "1–5",
    hours_per_week: "<2 hours",
    biggest_headache: "",
    priority_feature: "",
    willingness_to_pay: "Yes",
    urgency: "This quarter",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");

    const { error } = await supabase.from("waitlist").insert([formData]);

    if (error) {
      console.error(error);
      setStatus("❌ Something went wrong. Please try again.");
    } else {
      setStatus("✅ Thanks for joining the waitlist!");
      setFormData({
        name: "",
        email: "",
        agency: "",
        trips_per_month: "1–5",
        hours_per_week: "<2 hours",
        biggest_headache: "",
        priority_feature: "",
        willingness_to_pay: "Yes",
        urgency: "This quarter",
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Join the Waitlist 🚀
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Be the first to get early access and help shape the future of travel CRM.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact */}
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={formData.name}
            onChange={handleChange}
            required
            className="border rounded-lg p-3 w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email *"
            value={formData.email}
            onChange={handleChange}
            required
            className="border rounded-lg p-3 w-full"
          />
          <input
            type="text"
            name="agency"
            placeholder="Agency / Company *"
            value={formData.agency}
            onChange={handleChange}
            required
            className="border rounded-lg p-3 w-full"
          />

          {/* Trips per month */}
          <label className="block font-medium text-gray-700">
            How many trips do you organize per month? *
          </label>
          <select
            name="trips_per_month"
            value={formData.trips_per_month}
            onChange={handleChange}
            required
            className="border rounded-lg p-3 w-full"
          >
            <option>1–5</option>
            <option>6–15</option>
            <option>15+</option>
            <option>I’ve lost count 😅</option>
          </select>

          {/* Hours per week */}
          <label className="block font-medium text-gray-700">
            How much time do you spend on itinerary creation each week? *
          </label>
          <select
            name="hours_per_week"
            value={formData.hours_per_week}
            onChange={handleChange}
            required
            className="border rounded-lg p-3 w-full"
          >
            <option>&lt;2 hours</option>
            <option>2–5 hours</option>
            <option>5–10 hours</option>
            <option>10+ hours (send help 🚨)</option>
          </select>

          {/* CRM Pain Point */}
          <label className="block font-medium text-gray-700">
            Apart from itineraries, what’s the biggest headache in running your agency? *
          </label>
          <select
            name="biggest_headache"
            value={formData.biggest_headache}
            onChange={handleChange}
            required
            className="border rounded-lg p-3 w-full"
          >
            <option>Tracking client conversations</option>
            <option>Managing supplier contracts/prices</option>
            <option>Sending quotes & proposals</option>
            <option>Payments & invoices</option>
            <option>Following up with leads</option>
            <option>Something else</option>
          </select>

          {/* Priority Feature */}
          <textarea
            name="priority_feature"
            placeholder="Which problem would you want solved first?"
            value={formData.priority_feature}
            onChange={handleChange}
            rows="2"
            className="border rounded-lg p-3 w-full"
          />

          {/* Willingness to pay */}
          <label className="block font-medium text-gray-700">
            If this tool saved you most of this hassle, would you pay ₹1999/month? *
          </label>
          <select
            name="willingness_to_pay"
            value={formData.willingness_to_pay}
            onChange={handleChange}
            className="border rounded-lg p-3 w-full"
          >
            <option>Yes</option>
            <option>Maybe</option>
            <option>No</option>
          </select>

          {/* Urgency */}
          <label className="block font-medium text-gray-700">
            How soon do you need a better system? *
          </label>
          <select
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            required
            className="border rounded-lg p-3 w-full"
          >
            <option>Yesterday</option>
            <option>This quarter</option>
            <option>Later this year</option>
            <option>Just curious</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Join Waitlist
          </button>
        </form>
      </div>
        {status.includes("✅") && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">🎉 Success!</h2>
            <p className="text-gray-700 mb-6">{status}</p>
            <a
                href="/"   // ✅ simple href redirect
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
                Go to Demo
            </a>
            </div>
        </div>
        )}
    </main>
  );
}