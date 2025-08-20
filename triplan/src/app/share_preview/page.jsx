"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function SharePreviewContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");

  const [trip, setTrip] = useState(null);
  const [agencyName, setAgencyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [days, setDays] = useState([]);
  const [activities, setActivities] = useState({});
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    if (!tripId) return;

    const fetchData = async () => {
      // Fetch trip info with client + agency
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select(
          `
          id,
          trip_name,
          start_date,
          end_date,
          client_id,
          agency_id,
          clients(name),
          profiles!trips_agency_id_fkey(agency_name)
        `
        )
        .eq("id", tripId)
        .single();

      if (tripError) {
        console.error(tripError);
        return;
      }

      setTrip(tripData);
      setAgencyName(tripData.profiles?.agency_name || "Agency");
      setClientName(tripData.clients?.name || "Client");

      // Generate days list
      const start = new Date(tripData.start_date);
      const end = new Date(tripData.end_date);
      const tempDays = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        tempDays.push(d.toISOString().slice(0, 10));
      }
      setDays(tempDays);

      // Fetch activities
      const { data: acts, error: actsError } = await supabase
        .from("itinerary")
        .select("*")
        .eq("trip_id", tripId);

      if (actsError) {
        console.error(actsError);
      } else {
        const grouped = {};
        tempDays.forEach((day) => {
          grouped[day] = acts.filter((a) => a.day === day) || [];
        });
        setActivities(grouped);
      }

      // Fetch vendors
      const { data: vendorData } = await supabase
        .from("vendors")
        .select("id, name, type, phone, address1")
        .eq("agency_id", tripData.agency_id);

      setVendors(vendorData || []);
    };

    fetchData();
  }, [tripId]);

  if (!trip) {
    return <div className="p-6">Loading itinerary...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">{trip.trip_name}</h1>
      <p className="text-gray-700 mb-4">
        Client: <span className="font-medium">{clientName}</span> | Agency:{" "}
        <span className="font-medium">{agencyName}</span>
      </p>
      <p className="text-gray-600 mb-6">
        Duration: {trip.start_date} → {trip.end_date}
      </p>

      {/* Day blocks */}
      {days.map((day, idx) => (
        <div key={day} className="mb-6 border rounded p-4 bg-gray-50">
          <h2 className="font-semibold mb-3">
            Day {idx + 1} – {day}
          </h2>

          <div className="space-y-3">
            {activities[day]?.length > 0 ? (
              activities[day].map((act) => {
                const vendor = vendors.find(
                  (v) => String(v.id) === String(act.vendor_id)
                );
                const vendorName = vendor ? vendor.name : "";
                const vendorType = vendor ? vendor.type : "";

                return (
                  <div
                    key={act.id}
                    className="bg-white p-3 rounded border shadow-sm"
                  >
                    <p className="font-semibold">{act.title}</p>
                   <p className="text-sm text-gray-700">
                    {vendorName} | {vendorType} | {act.time}
                  </p>

                  <div className="text-sm mt-1 flex flex-wrap items-center gap-2">
                    {/* Google Maps Link */}
                    {act.maps_link && (
                      <a
                        href={act.maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 underline"
                      >
                        📍 View on Map
                      </a>
                    )}

                    {/* Separator if both exist */}
                    {act.maps_link && act.pdf_urls && act.pdf_urls.length > 0 && <span>|</span>}

                    {/* Show PDFs as links */}
                    {act.pdf_urls && act.pdf_urls.length > 0 && (
                      <span className="text-blue-600">
                        {act.pdf_urls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline mr-2"
                          >
                            PDF {idx + 1}
                          </a>
                        ))}
                      </span>
                    )}
                  </div>

                    <p className="text-sm text-gray-600 mt-1">
                      Contact: {act.contact_name} | {act.contact_phone}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="italic text-gray-500">
                No activities planned for this day.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SharePreviewPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading preview...</div>}>
      <SharePreviewContent />
    </Suspense>
  );
}