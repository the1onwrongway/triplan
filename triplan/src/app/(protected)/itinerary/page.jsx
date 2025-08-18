"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function ItineraryPage() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [days, setDays] = useState([]);
  const [activities, setActivities] = useState({});
  const [showFormForDay, setShowFormForDay] = useState(null);
  const [activityForm, setActivityForm] = useState({});
  const [editingActivity, setEditingActivity] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [agencyId, setAgencyId] = useState(null);

  // Fetch agency profile, trips, and vendors
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      if (!profile) return;

      setAgencyId(profile.id);

      // Fetch trips
      const { data: tripsData, error: tripsError } = await supabase
        .from("trips")
        .select("id, trip_name, start_date, end_date")
        .eq("agency_id", profile.id);
      if (tripsError) console.error(tripsError);
      else setTrips(tripsData || []);

      // Fetch all vendors for this agency including phone
      const { data: vendorsData, error: vendorsError } = await supabase
        .from("vendors")
        .select("id, name, type, phone, address1")
        .eq("agency_id", profile.id);
      if (vendorsError) console.error(vendorsError);
      else {
        setVendors(vendorsData || []);
        const types = Array.from(new Set(vendorsData.map((v) => v.type)));
        setActivityTypes(types);
      }
    };

    fetchData();
  }, []);

  // Generate day blocks & fetch activities whenever a trip is selected
  useEffect(() => {
    if (!selectedTrip) return;

    const start = new Date(selectedTrip.start_date);
    const end = new Date(selectedTrip.end_date);
    const tempDays = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      tempDays.push(d.toISOString().slice(0, 10));
    }
    setDays(tempDays);

    const fetchActivities = async () => {
      const { data: acts, error } = await supabase
        .from("itinerary")
        .select("*")
        .eq("trip_id", selectedTrip.id);
      if (error) console.error(error);
      else {
        const grouped = {};
        tempDays.forEach((day) => {
          grouped[day] = acts.filter((a) => a.day === day) || [];
        });
        setActivities(grouped);
      }
    };

    fetchActivities();
  }, [selectedTrip?.id]);

  // Autofill contact info when vendor changes
  useEffect(() => {
    if (!activityForm.vendor_id) return;
    const selectedVendor = vendors.find(
      (v) => String(v.id) === String(activityForm.vendor_id)
    );
    if (selectedVendor) {
      setActivityForm((prev) => ({
        ...prev,
        contact_name: selectedVendor.name,
        contact_phone: selectedVendor.phone,
      }));
    }
  }, [activityForm.vendor_id, vendors]);

  const handleActivityChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setActivityForm((prev) => ({
        ...prev,
        type: value,
        vendor_id: "",
        contact_name: "",
        contact_phone: "",
      }));
      return;
    }

    setActivityForm((prev) => ({ ...prev, [name]: value }));
  };

  // Upload PDFs to Supabase storage and get public URLs
  const uploadPDFs = async (files, activityId) => {
    if (!files || files.length === 0) return [];

    const urls = [];
    for (let file of files) {
      const fileName = `${activityId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("itinerary-pdfs")
        .upload(fileName, file);
      if (error) console.error("PDF Upload Error:", error);
      else {
        const { publicUrl } = supabase.storage
          .from("itinerary-pdfs")
          .getPublicUrl(fileName);
        urls.push(publicUrl);
      }
    }
    return urls;
  };

  const handleSaveActivity = async (day) => {
    const requiredFields = ["title", "type", "time", "vendor_id"];
    for (let field of requiredFields) {
      if (!activityForm[field] || activityForm[field].trim() === "") {
        alert(`Please fill in the mandatory field: ${field}`);
        return;
      }
    }

    const activityId =
      editingActivity?.activity?.id || uuidv4();

    // Upload PDFs and get URLs
    const pdf_urls = await uploadPDFs(activityForm.pdfs, activityId);

    const activityData = {
      id: activityId,
      trip_id: selectedTrip.id,
      day,
      title: activityForm.title,
      type: activityForm.type,
      time: activityForm.time,
      maps_link: activityForm.maps_link || null,
      vendor_id: activityForm.vendor_id,
      cost: activityForm.cost || null,
      contact_name: activityForm.contact_name || "",
      contact_phone: activityForm.contact_phone || "",
      pdf_urls,
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (editingActivity) {
      await supabase
        .from("itinerary")
        .update(activityData)
        .eq("id", activityId);
    } else {
      await supabase.from("itinerary").insert([activityData]);
    }

    const updatedActivities = [...(activities[day] || [])];
    const index = updatedActivities.findIndex((a) => a.id === activityId);
    if (index >= 0) updatedActivities[index] = activityData;
    else updatedActivities.push(activityData);

    setActivities({ ...activities, [day]: updatedActivities });
    setActivityForm({});
    setShowFormForDay(null);
    setEditingActivity(null);
  };

  const handleEditActivity = (day, activity) => {
    setActivityForm(activity);
    setShowFormForDay(day);
    setEditingActivity({ day, activity });
  };

  const handleDeleteActivity = async (day, activityId) => {
    await supabase.from("itinerary").delete().eq("id", activityId);
    const updatedActivities = activities[day].filter(
      (act) => act.id !== activityId
    );
    setActivities({ ...activities, [day]: updatedActivities });

    if (editingActivity?.activity?.id === activityId) {
      setEditingActivity(null);
      setActivityForm({});
      setShowFormForDay(null);
    }
  };

  const filteredVendors = vendors.filter((v) => v.type === activityForm.type);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Itinerary</h1>

      {/* Trip Selector */}
      <div className="mb-6">
        <label className="block mb-1 font-semibold">Select Trip</label>
        <select
          className="border p-2 w-full"
          value={selectedTrip?.id || ""}
          onChange={(e) => {
            const trip = trips.find((t) => t.id === e.target.value);
            setSelectedTrip(trip || null);
          }}
        >
          <option value="">-- Select Trip --</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.trip_name} ({trip.start_date} → {trip.end_date})
            </option>
          ))}
        </select>
      </div>

      {/* Day Blocks */}
      {days.map((day) => (
        <div key={day} className="mb-6 border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Day – {day}</h2>
            <button
              onClick={() => {
                setShowFormForDay(showFormForDay === day ? null : day);
                setActivityForm({});
                setEditingActivity(null);
              }}
              className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded"
            >
              <Plus size={16} /> Add Activity
            </button>
          </div>

          {/* Activity Form */}
          {showFormForDay === day && (
            <div className="mb-4 border p-4 rounded bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={activityForm.title || ""}
                    onChange={handleActivityChange}
                    className="border p-2 w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1">Type *</label>
                  <select
                    name="type"
                    value={activityForm.type || ""}
                    onChange={handleActivityChange}
                    className="border p-2 w-full"
                  >
                    <option value="">-- Select Type --</option>
                    {activityTypes.map((type, idx) => (
                      <option key={idx} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={activityForm.time || ""}
                    onChange={handleActivityChange}
                    className="border p-2 w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1">Google Maps Link</label>
                  <input
                    type="text"
                    name="maps_link"
                    value={activityForm.maps_link || ""}
                    onChange={handleActivityChange}
                    className="border p-2 w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1">Vendor *</label>
                  <select
                    name="vendor_id"
                    value={activityForm.vendor_id || ""}
                    onChange={handleActivityChange}
                    className="border p-2 w-full"
                  >
                    <option value="">-- Select Vendor --</option>
                    {filteredVendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Cost</label>
                  <input
                    type="number"
                    name="cost"
                    value={activityForm.cost || ""}
                    onChange={handleActivityChange}
                    className="border p-2 w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1">Contact Name</label>
                  <input
                    type="text"
                    name="contact_name"
                    value={activityForm.contact_name || ""}
                    className="border p-2 w-full"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={activityForm.contact_phone || ""}
                    className="border p-2 w-full"
                    readOnly
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-1">
                    Upload PDFs (Tickets, Vouchers)
                  </label>
                  <input
                    type="file"
                    name="pdfs"
                    multiple
                    accept="application/pdf"
                    onChange={(e) => {
                      setActivityForm({
                        ...activityForm,
                        pdfs: e.target.files
                          ? Array.from(e.target.files)
                          : [],
                      });
                    }}
                    className="border p-2 w-full"
                  />
                  {activityForm.pdfs && activityForm.pdfs.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600">
                      {activityForm.pdfs.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleSaveActivity(day)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {editingActivity ? "Update Activity" : "Save Activity"}
                </button>
                {editingActivity && (
                  <button
                    onClick={() =>
                      handleDeleteActivity(day, editingActivity.activity.id)
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowFormForDay(null);
                    setActivityForm({});
                    setEditingActivity(null);
                  }}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {activities[day]?.map((act) => {
              const vendor = vendors.find(
                (v) => String(v.id) === String(act.vendor_id)
              );
              const vendorName = vendor ? vendor.name : "";
              const vendorType = vendor ? vendor.type : "";

              return (
                <div
                  key={act.id}
                  className="flex justify-between items-center bg-white p-2 rounded border"
                >
                  <div>
                    <p className="font-semibold">{act.title}</p>
                    <p className="text-sm">
                      {vendorName} | {vendorType} | {act.time}
                    </p>
                    {act.pdf_urls && act.pdf_urls.length > 0 && (
                      <ul className="text-sm text-gray-600 mt-1">
                        {act.pdf_urls.map((url, idx) => (
                          <li key={idx}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              PDF {idx + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-sm text-gray-600">
                      Contact: {act.contact_name} | {act.contact_phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditActivity(day, act)}>
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(day, act.id)}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}