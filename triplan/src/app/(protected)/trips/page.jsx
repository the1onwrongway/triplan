"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Plus } from "lucide-react";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    client_id: "",
    trip_name: "",
    start_date: "",
    end_date: "",
    budget: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [agencyId, setAgencyId] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);

  // ✅ Get logged-in user's agency id
  useEffect(() => {
    const fetchAgencyId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setAgencyId(data.id);
      }
    };

    fetchAgencyId();
  }, []);

  // ✅ Fetch clients belonging to this agency
  useEffect(() => {
    const fetchClients = async () => {
      if (!agencyId) return;
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("agency_id", agencyId);

      if (error) console.error("Error fetching clients:", error.message);
      else setClients(data);
    };

    fetchClients();
  }, [agencyId]);

  // ✅ Fetch trips for this agency
  async function fetchTrips() {
    if (!agencyId) return;
    const { data, error } = await supabase
      .from("trips")
      .select(
        `
        id,
        trip_name,
        start_date,
        end_date,
        budget,
        clients (id, name)
      `
      )
      .eq("agency_id", agencyId);

    if (error) console.error("Error fetching trips:", error.message);
    else setTrips(data);
  }

  useEffect(() => {
    fetchTrips();
  }, [agencyId]);

  // ✅ Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Save or Update trip
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agencyId) return;

    if (editingTrip) {
      // update
      const { error } = await supabase
        .from("trips")
        .update({
          ...formData,
        })
        .eq("id", editingTrip.id)
        .eq("agency_id", agencyId);

      if (error) console.error("Error updating trip:", error.message);
    } else {
      // insert
      const { error } = await supabase.from("trips").insert([
        {
          ...formData,
          agency_id: agencyId,
        },
      ]);

      if (error) console.error("Error adding trip:", error.message);
    }

    setFormData({
      client_id: "",
      trip_name: "",
      start_date: "",
      end_date: "",
      budget: "",
    });
    setShowForm(false);
    setEditingTrip(null);
    fetchTrips();
  };

  // ✅ Delete trip
  const handleDelete = async () => {
    if (!editingTrip) return;
    const { error } = await supabase
      .from("trips")
      .delete()
      .eq("id", editingTrip.id)
      .eq("agency_id", agencyId);

    if (error) console.error("Error deleting trip:", error.message);

    setFormData({
      client_id: "",
      trip_name: "",
      start_date: "",
      end_date: "",
      budget: "",
    });
    setShowForm(false);
    setEditingTrip(null);
    fetchTrips();
  };

  // ✅ Edit mode
  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      client_id: trip.clients?.id || "",
      trip_name: trip.trip_name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      budget: trip.budget,
    });
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trips</h1>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4 flex items-center"
        >
          <Plus size={16} className="mr-2" /> Add Trip
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-6 border p-4 rounded"
        >
          {/* Row 1: Client + Trip Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Client</label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Trip Name</label>
              <input
                type="text"
                name="trip_name"
                value={formData.trip_name}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </div>
          </div>

          {/* Row 2: Start Date + End Date + Budget */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label className="block mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label className="block mb-1">Budget</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="border p-2 w-full"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {editingTrip ? "Update Trip" : "Save Trip"}
            </button>

            {editingTrip && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete Trip
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingTrip(null);
                setFormData({
                  client_id: "",
                  trip_name: "",
                  start_date: "",
                  end_date: "",
                  budget: "",
                });
              }}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Trip Name</th>
            <th className="border px-4 py-2">Client</th>
            <th className="border px-4 py-2">Start Date</th>
            <th className="border px-4 py-2">End Date</th>
            <th className="border px-4 py-2">Edit</th>
          </tr>
        </thead>
        <tbody>
          {trips.length > 0 ? (
            trips.map((trip) => (
              <tr key={trip.id}>
                <td className="border px-4 py-2">{trip.trip_name}</td>
                <td className="border px-4 py-2">
                  {trip.clients?.name || "Unknown"}
                </td>
                <td className="border px-4 py-2">{trip.start_date}</td>
                <td className="border px-4 py-2">{trip.end_date}</td>
                <td className="border px-4 py-2 text-center">
                  <button onClick={() => handleEdit(trip)}>
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No trips added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}