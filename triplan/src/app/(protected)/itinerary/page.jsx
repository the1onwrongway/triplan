"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


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

  const generateItineraryPDF = (agencyName, clientName, trip, days, activities) => {
    const doc = new jsPDF();
    
    // Define colors
    const primaryColor = [41, 128, 185]; // Blue
    const secondaryColor = [52, 152, 219]; // Lighter blue
    const accentColor = [155, 89, 182]; // Purple
    const textColor = [44, 62, 80]; // Dark gray

    // Function to add header to each page
    const addHeader = () => {
      // Header Section
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 45, 'F'); // Header background
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text(`${trip.trip_name}`, 14, 22);
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      doc.text(`by ${agencyName}`, 14, 32);
      
      // Powered by Triplan
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text('Powered by Triplan', 150, 40);

      // Client Info Section
      doc.setFillColor(...secondaryColor);
      doc.rect(0, 45, 210, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`Client: ${clientName}`, 14, 58);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Duration: ${trip.start_date} to ${trip.end_date}`, 14, 65);
    };

    // Function to format time to 12-hour format
    const formatTime = (time24) => {
      if (!time24) return '';
      const [hours, minutes] = time24.split(':');
      const hour12 = ((parseInt(hours) + 11) % 12) + 1;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    // Add header to first page
    addHeader();

    let y = 85;

    // Itinerary Content
    doc.setTextColor(...textColor);
    
    days.forEach((day, dayIndex) => {
      // Check if we need a new page
      if (y > 220) {
        doc.addPage();
        addHeader(); // Add header to new page
        y = 85;
      }

      // Day Header
      doc.setFillColor(...accentColor);
      doc.rect(14, y - 8, 182, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      const dayDate = new Date(day);
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = dayDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(`Day ${dayIndex + 1} - ${dayName}, ${formattedDate}`, 18, y + 4);
      
      y += 25;

      const dayActivities = activities[day] || [];
      
      if (dayActivities.length > 0) {
        // Create table data with vendor names and formatted times
        const tableData = dayActivities.map((act) => {
          const vendor = vendors.find(v => String(v.id) === String(act.vendor_id));
          const vendorName = vendor ? vendor.name : '-';
          const formattedTime = formatTime(act.time);
          
          return [
            formattedTime,
            act.title, // Just the title, we'll add [PDF] link in didDrawCell
            act.type,
            vendorName,
            act.contact_name || '-',
            act.contact_phone || '-'
          ];
        });

        // Generate table
        autoTable(doc, {
          startY: y,
          head: [['Time', 'Activity', 'Type', 'Vendor', 'Contact', 'Phone']],
          body: tableData,
          styles: { 
            fontSize: 9,
            cellPadding: 4,
            textColor: textColor
          },
          headStyles: { 
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          columnStyles: {
            0: { cellWidth: 25 }, // Time
            1: { cellWidth: 45 }, // Activity
            2: { cellWidth: 25 }, // Type
            3: { cellWidth: 35 }, // Vendor
            4: { cellWidth: 30 }, // Contact
            5: { cellWidth: 30 }  // Phone
          },
          margin: { left: 14, right: 14 },
          didDrawCell: function(data) {
            // Add clickable [PDF] link after activity title if PDFs exist
            if (data.section === 'body' && data.column.index === 1) {
              const activityIndex = data.row.index;
              const activity = dayActivities[activityIndex];
              if (activity && activity.pdf_urls && activity.pdf_urls.length > 0) {
                // First draw the activity title normally
                const titleWidth = doc.getTextWidth(activity.title);
                const linkY = data.cell.y + data.cell.height / 2 + 2;
                
                // Add the [PDF] link after the title
                doc.setTextColor(52, 152, 219); // Blue for the link
                doc.textWithLink(' [PDF]', data.cell.x + 2 + titleWidth + 2, linkY, { 
                  url: activity.pdf_urls[0] 
                });
                
                // Reset text color back to normal
                doc.setTextColor(...textColor);
              }
            }
          }
        });

        y = doc.lastAutoTable.finalY + 10;

      } else {
        doc.setTextColor(149, 165, 166);
        doc.setFontSize(12);
        doc.setFont(undefined, 'italic');
        doc.text('No activities planned for this day', 18, y);
        y += 20;
      }

      // Check if we need a new page after activities
      if (y > 220) {
        doc.addPage();
        addHeader(); // Add header to new page
        y = 85;
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(149, 165, 166);
      doc.text(`Generated by ${agencyName} | Page ${i} of ${pageCount}`, 14, 285);
      doc.text(`Powered by Triplan`, 170, 285);
    }

    // Save the PDF
    const fileName = `${trip.trip_name.replace(/[^a-z0-9]/gi, '_')}_Itinerary.pdf`;
    doc.save(fileName);
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

      {/* PDF Download Button */}
      {selectedTrip && (
  <div className="mb-6 flex flex-wrap gap-3">
    <button
      onClick={() =>
        generateItineraryPDF(
          agencyName,
          clientName,
          selectedTrip,
          days,
          activities
        )
      }
      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
    >
      📄 Download PDF
    </button>

    <button
      onClick={() =>
        window.open(`/share_preview?tripId=${selectedTrip?.id}`, '_blank')
      }
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
    >
      🔗 Share Preview
    </button>

    <button
      onClick={() =>
        navigator.clipboard.writeText(
          `${window.location.origin}/share_preview?tripId=${selectedTrip?.id}`
        )
      }
      className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
    >
      📋 Copy Link
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

                  {/* NEW: Show newly selected files (as before) */}
                  {activityForm.pdfs && activityForm.pdfs.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600">
                      {activityForm.pdfs.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  )}

                  {/* NEW: Show existing PDFs when editing */}
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