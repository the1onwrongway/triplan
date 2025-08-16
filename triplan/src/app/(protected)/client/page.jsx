"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Plus } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
    preferred_type: "Solo",
    special_notes: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get logged-in user (agency)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error("Auth error:", error);
      if (user) {
        setUserId(user.id);
        fetchClients(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch clients for this agency only
  const fetchClients = async (agencyId) => {
    let { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("agency_id", agencyId);

    if (error) {
      console.error("Error fetching clients:", error.message);
    } else {
      setClients(data);
    }
  };

  // Save client (insert/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    if (form.id) {
      // Update existing
      const { error } = await supabase
        .from("clients")
        .update({
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          preferred_type: form.preferred_type,
          special_notes: form.special_notes,
        })
        .eq("id", form.id)
        .eq("agency_id", userId);

      if (error) {
        console.error("Update error:", error.message);
      } else {
        fetchClients(userId);
        setShowForm(false);
        resetForm();
      }
    } else {
      // Insert new
      const { error } = await supabase.from("clients").insert([
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          preferred_type: form.preferred_type,
          special_notes: form.special_notes,
          agency_id: userId,
        },
      ]);

      if (error) {
        console.error("Insert error:", error.message);
      } else {
        fetchClients(userId);
        setShowForm(false);
        resetForm();
      }
    }
  };

  // Delete client
  const handleDelete = async () => {
    if (!form.id) return;
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", form.id)
      .eq("agency_id", userId);

    if (error) {
      console.error("Delete error:", error.message);
    } else {
      fetchClients(userId);
      setShowForm(false);
      resetForm();
    }
  };

  // Open edit form
  const handleEdit = (client) => {
    setForm(client);
    setShowForm(true);
  };

  // Reset form state
  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      pincode: "",
      preferred_type: "Solo",
      special_notes: "",
    });
  };

  return (
      <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      
      {!showForm && (
        <>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="mb-4 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} /> Add Client
          </button>
          <table className="w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">City</th>
                <th className="border p-2">State</th>
                <th className="border p-2">Travel Type</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="border p-2">{c.name}</td>
                  <td className="border p-2">{c.email}</td>
                  <td className="border p-2">{c.phone}</td>
                  <td className="border p-2">{c.city}</td>
                  <td className="border p-2">{c.state}</td>
                  <td className="border p-2">{c.preferred_type}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="text-blue-500"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
          <input
            type="text"
            placeholder="Name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            className="w-full border p-2 rounded"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="City"
            className="w-full border p-2 rounded"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            type="text"
            placeholder="State"
            className="w-full border p-2 rounded"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <input
            type="text"
            placeholder="Pincode"
            className="w-full border p-2 rounded"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          />
          <select
            className="w-full border p-2 rounded"
            value={form.preferred_type}
            onChange={(e) => setForm({ ...form, preferred_type: e.target.value })}
          >
            <option value="Solo">Solo</option>
            <option value="Family">Family</option>
            <option value="Group">Group</option>
            <option value="Couple">Couple</option>
          </select>
          <textarea
            placeholder="Special Notes"
            className="w-full border p-2 rounded"
            value={form.special_notes}
            onChange={(e) =>
              setForm({ ...form, special_notes: e.target.value })
            }
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              {form.id ? "Update Client" : "Add Client"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}