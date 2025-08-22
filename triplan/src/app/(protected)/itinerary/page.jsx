"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Plus, Trash2, Download } from "lucide-react";
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
  const [agencyName, setAgencyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch agency profile, trips, and vendors
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, agency_name")
        .eq("id", user.id)
        .single();
      if (!profile) return;

      setAgencyId(profile.id);
      setAgencyName(profile.agency_name || "Your Agency");

      // Fetch trips with client names
      const { data: tripsData, error: tripsError } = await supabase
        .from("trips")
        .select(`
          id, 
          trip_name, 
          start_date, 
          end_date, 
          client_id,
          clients(name)
        `)
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
    setClientName(selectedTrip.clients?.name || "Client");

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

      if (error) {
        console.error("PDF Upload Error:", error);
      } else {
        // Get a signed URL valid for 7 days (you can change duration)
        const { data: signed } = await supabase.storage
          .from("itinerary-pdfs")
          .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days
        if (signed?.signedUrl) {
          urls.push(signed.signedUrl);
        }
      }
    }
    return urls;
  };

  const handleSaveActivity = async (day) => {
    const requiredFields = ["title", "type", "time", "vendor_id"];
    for (let field of requiredFields) {
      const val = activityForm[field];
      if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
        alert(`Please fill in the mandatory field: ${field}`);
        return;
      }
    }

    const activityId = editingActivity?.activity?.id || uuidv4();

    // Upload new PDFs and merge with existing ones (if editing)
    const newlyUploadedUrls = await uploadPDFs(activityForm.pdfs, activityId);
    const pdf_urls = [
      ...(activityForm.existing_pdfs || []),
      ...newlyUploadedUrls,
    ];

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
      await supabase.from("itinerary").update(activityData).eq("id", activityId);
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
    // Preserve existing URLs in a separate field and reset file input
    setActivityForm({
      ...activity,
      pdfs: [],
      existing_pdfs: activity.pdf_urls || [],
    });
    setShowFormForDay(day);
    setEditingActivity({ day, activity });
  };

  const handleDeleteActivity = async (day, activityId) => {
    await supabase.from("itinerary").delete().eq("id", activityId);
    const updatedActivities = activities[day].filter((act) => act.id !== activityId);
    setActivities({ ...activities, [day]: updatedActivities });

    if (editingActivity?.activity?.id === activityId) {
      setEditingActivity(null);
      setActivityForm({});
      setShowFormForDay(null);
    }
  };

  // PDF Generation Function
  const generatePDF = async () => {
    if (!selectedTrip) {
      alert("Please select a trip first");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Create a new window with the itinerary content
      const printWindow = window.open('', '_blank');
      
      // Generate HTML content for PDF
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${selectedTrip.trip_name} - Itinerary</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #333;
              font-size: 28px;
              margin-bottom: 10px;
            }
            .header-info {
              font-size: 16px;
              color: #666;
              margin: 5px 0;
            }
            .day-block {
              margin-bottom: 25px;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              background: #f9f9f9;
            }
            .day-title {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              margin-bottom: 15px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 8px;
            }
            .activity-card {
              background: white;
              border: 1px solid #ddd;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 12px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .activity-title {
              font-size: 16px;
              font-weight: bold;
              color: #333;
              margin-bottom: 8px;
            }
            .activity-info {
              font-size: 14px;
              color: #666;
              margin-bottom: 6px;
            }
            .activity-contact {
              font-size: 13px;
              color: #777;
              margin-top: 8px;
            }
            .activity-links {
              font-size: 13px;
              margin-top: 6px;
            }
            .map-link {
              color: #2563eb;
              text-decoration: none;
            }
            .pdf-link {
              color: #dc2626;
              text-decoration: none;
              margin-right: 8px;
            }
            .no-activities {
              font-style: italic;
              color: #999;
              text-align: center;
              padding: 20px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .day-block { break-inside: avoid; }
              .activity-card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedTrip.trip_name}</h1>
            <div class="header-info">
              <strong>Client:</strong> ${clientName} | <strong>Agency:</strong> ${agencyName}
            </div>
            <div class="header-info">
              <strong>Duration:</strong> ${selectedTrip.start_date} → ${selectedTrip.end_date}
            </div>
          </div>

          ${days.map((day, idx) => {
            const dayActivities = activities[day] || [];
            return `
              <div class="day-block">
                <div class="day-title">Day ${idx + 1} – ${day}</div>
                ${dayActivities.length > 0 ? 
                  dayActivities.map(act => {
                    const vendor = vendors.find(v => String(v.id) === String(act.vendor_id));
                    const vendorName = vendor ? vendor.name : "";
                    const vendorType = vendor ? vendor.type : "";
                    
                    return `
                      <div class="activity-card">
                        <div class="activity-title">${act.title}</div>
                        <div class="activity-info">${vendorName} | ${vendorType} | ${act.time}</div>
                        ${(act.maps_link || (act.pdf_urls && act.pdf_urls.length > 0)) ? `
                          <div class="activity-links">
                            ${act.maps_link ? `<a href="${act.maps_link}" class="map-link">📍 View on Map</a>` : ''}
                            ${act.maps_link && act.pdf_urls && act.pdf_urls.length > 0 ? ' | ' : ''}
                            ${act.pdf_urls && act.pdf_urls.length > 0 ? 
                              act.pdf_urls.map((url, idx) => `<a href="${url}" class="pdf-link">PDF ${idx + 1}</a>`).join(' ')
                              : ''
                            }
                          </div>
                        ` : ''}
                        <div class="activity-contact">Contact: ${act.contact_name || 'N/A'} | ${act.contact_phone || 'N/A'}</div>
                      </div>
                    `;
                  }).join('')
                  : '<div class="no-activities">No activities planned for this day.</div>'
                }
              </div>
            `;
          }).join('')}
        </body>
        </html>
      `;

      printWindow.document.write(pdfContent);
      printWindow.document.close();

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setIsGeneratingPDF(false);
        }, 500);
      };

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
      setIsGeneratingPDF(false);
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

      {/* Action Buttons */}
      {selectedTrip && (
        <div className="mb-6 flex gap-3">
          <button
            onClick={() =>
              window.open(`/share_preview?tripId=${selectedTrip?.id}`, '_blank')
            }
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
          >
            🔗 Preview
          </button>
          
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
          >
            <Download size={18} />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      )}

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
                    onChange={handleActivityChange}
                    className="border p-2 w-full"
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className="block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={activityForm.contact_phone || ""}
                    onChange={handleActivityChange}
                    className="border p-2 w-full"
                    placeholder="Contact phone number"
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
                        pdfs: e.target.files ? Array.from(e.target.files) : [],
                      });
                    }}
                    className="border p-2 w-full"
                  />

                  {/* Show newly selected files */}
                  {activityForm.pdfs && activityForm.pdfs.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600">
                      {activityForm.pdfs.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  )}

                  {/* Show existing PDFs when editing */}
                  {activityForm.existing_pdfs &&
                  activityForm.existing_pdfs.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium">Existing PDFs</p>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {activityForm.existing_pdfs.map((url, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              PDF {idx + 1}
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setActivityForm((prev) => ({
                                  ...prev,
                                  existing_pdfs: prev.existing_pdfs.filter(
                                    (_, i) => i !== idx
                                  ),
                                }));
                              }}
                              className="text-red-500 hover:text-red-700"
                              title="Remove PDF"
                            >
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
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
                    <button onClick={() => handleDeleteActivity(day, act.id)}>
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