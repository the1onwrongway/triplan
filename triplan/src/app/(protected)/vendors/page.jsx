"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Plus } from "lucide-react";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null); // track vendor being edited
  const [agencyId, setAgencyId] = useState(null); // store current agency id
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const [formData, setFormData] = useState({
    type: "Hotel",
    name: "",
    address1: "",
    phone: "",
    address2: "",
    email: "",
    state: "",
    website: "",
    city: "",
    pincode: "",
    special_notes: "",
  });

  // ✅ Get current agency id and fetch vendors
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setVendors([]);
        setLoading(false);
        return;
      }

      // profiles.id IS the agency id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Could not load profile:", profileError?.message);
        setVendors([]);
        setLoading(false);
        return;
      }

      setAgencyId(profile.id);

      // Fetch vendors only for this agency
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("agency_id", profile.id);

      if (error) {
        console.error("Error fetching vendors:", error.message);
      } else {
        setVendors(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Add / Update vendor
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validTypes = [
      "Hotel",
      "Transportation",
      "Local Sightseeing",
      "Restaurant",
      "Guide",
      "Event Venue",
      "Other",
    ];
    if (!validTypes.includes(formData.type)) {
      console.error("Invalid type selected:", formData.type);
      return;
    }

    let data, error;

    if (editingVendor) {
      // update vendor
      ({ data, error } = await supabase
        .from("vendors")
        .update(formData)
        .eq("id", editingVendor.id)
        .eq("agency_id", agencyId)); // safeguard
    } else {
      // insert new vendor with agency_id attached
      ({ data, error } = await supabase
        .from("vendors")
        .insert([{ ...formData, agency_id: agencyId }])
        .select());
    }

    if (error) {
      console.error("Save error:", error.message);
    } else {
      if (editingVendor) {
        // update local state
        setVendors(
          vendors.map((v) =>
            v.id === editingVendor.id ? { ...v, ...formData } : v
          )
        );
      } else {
        setVendors([...vendors, ...(data || [])]);
      }

      // reset form
      setShowForm(false);
      setEditingVendor(null);
      resetForm();
    }
  };

  // Handle delete vendor
  const handleDelete = async () => {
    if (!editingVendor) return;

    const { error } = await supabase
      .from("vendors")
      .delete()
      .eq("id", editingVendor.id)
      .eq("agency_id", agencyId); // safeguard

    if (error) {
      console.error("Delete error:", error.message);
    } else {
      // remove from local state
      setVendors(vendors.filter((v) => v.id !== editingVendor.id));
      setShowForm(false);
      setEditingVendor(null);
      resetForm();
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      type: vendor.type || "Hotel",
      name: vendor.name || "",
      address1: vendor.address1 || "",
      phone: vendor.phone || "",
      address2: vendor.address2 || "",
      email: vendor.email || "",
      state: vendor.state || "",
      website: vendor.website || "",
      city: vendor.city || "",
      pincode: vendor.pincode || "",
      special_notes: vendor.special_notes || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      type: "Hotel",
      name: "",
      address1: "",
      phone: "",
      address2: "",
      email: "",
      state: "",
      website: "",
      city: "",
      pincode: "",
      special_notes: "",
    });
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vendors</h1>

      {/* Add Vendor Button */}
      <button
        onClick={() => {
          setShowForm(true);
          setEditingVendor(null); // reset editing mode
          resetForm();
        }}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Vendor
      </button>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-100 p-4 rounded">
          <div className="grid grid-cols-2 gap-4">
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="p-2 border rounded"
            >
              <option>Hotel</option>
              <option>Transportation</option>
              <option>Local Sightseeing</option>
              <option>Restaurant</option>
              <option>Guide</option>
              <option>Event Venue</option>
              <option>Other</option>
            </select>
            <input
              type="text"
              name="name"
              placeholder="Name*"
              value={formData.name}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              name="address1"
              placeholder="Address 1*"
              value={formData.address1}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              name="address2"
              placeholder="Address 2"
              value={formData.address2}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="city"
              placeholder="City*"
              value={formData.city}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              name="pincode"
              placeholder="Pincode*"
              value={formData.pincode}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State*"
              value={formData.state}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone*"
              value={formData.phone}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="website"
              placeholder="Website"
              value={formData.website}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <textarea
              name="special_notes"
              placeholder="Special Notes"
              value={formData.special_notes}
              onChange={handleChange}
              className="p-2 border rounded col-span-2"
            />
          </div>

          <div className="mt-4 flex justify-between">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editingVendor ? "Update Vendor" : "Save Vendor"}
            </button>

            {editingVendor && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Vendor
              </button>
            )}
          </div>
        </form>
      )}

      {/* Vendors Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">City</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id}>
              <td className="p-2 border">{v.type}</td>
              <td className="p-2 border">{v.name}</td>
              <td className="p-2 border">{v.phone}</td>
              <td className="p-2 border">{v.email}</td>
              <td className="p-2 border">{v.city}</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => handleEdit(v)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 
                        bg-gradient-to-br from-black/40 via-gray-800/30 to-black/40">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete vendor{" "}
              <span className="font-semibold">"{editingVendor?.name}"</span>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDelete();
                  setShowDeleteConfirm(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}