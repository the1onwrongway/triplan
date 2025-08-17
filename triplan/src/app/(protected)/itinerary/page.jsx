"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ItineraryPage() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null);

  const [form, setForm] = useState({
    trip_name: "",
    day: "",
    activity: "",
  });

  // Fetch itineraries
  const fetchItineraries = async () => {
  const { data, error } = await supabase.from("itineraries").select("*");
  if (error) console.error("Error fetching itineraries:", error.message);
  else setItineraries(data);
  setLoading(false);
};
  useEffect(() => {
    fetchItineraries();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save itinerary
  const handleSave = async () => {
    if (editingItinerary) {
      await supabase.from("itineraries").update(form).eq("id", editingItinerary.id);
    } else {
      await supabase.from("itineraries").insert([form]);
    }
    setForm({ trip_name: "", day: "", activity: "" });
    setEditingItinerary(null);
    setShowForm(false);
    fetchItineraries();
  };

  // Delete itinerary
  const handleDelete = async (id) => {
    await supabase.from("itineraries").delete().eq("id", id);
    fetchItineraries();
  };

  if (loading) return <div>Loading itineraries...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Itineraries</h1>
        <button
          onClick={() => {
            setForm({ trip_name: "", day: "", activity: "" });
            setEditingItinerary(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus size={16} /> New Itinerary
        </button>
      </div>

      {/* Table */}
      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Trip Name</th>
            <th className="px-4 py-2 text-left">Day</th>
            <th className="px-4 py-2 text-left">Activity</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {itineraries.map((itinerary) => (
            <tr key={itinerary.id} className="border-t">
              <td className="px-4 py-2">{itinerary.trip_name}</td>
              <td className="px-4 py-2">{itinerary.day}</td>
              <td className="px-4 py-2">{itinerary.activity}</td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => {
                    setForm(itinerary);
                    setEditingItinerary(itinerary);
                    setShowForm(true);
                  }}
                  className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(itinerary.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editingItinerary ? "Edit Itinerary" : "New Itinerary"}
            </h2>
            <input
              type="text"
              name="trip_name"
              placeholder="Trip Name"
              value={form.trip_name}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              name="day"
              placeholder="Day"
              value={form.day}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <textarea
              name="activity"
              placeholder="Activity"
              value={form.activity}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                {editingItinerary ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}