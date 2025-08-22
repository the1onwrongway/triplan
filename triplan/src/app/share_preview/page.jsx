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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Dynamic imports to avoid SSR issues
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.getElementById('itinerary-content');
      if (!element) {
        console.error('Content element not found');
        return;
      }

      // Create canvas with higher resolution for better quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f3f4f6', // Grey background
        logging: false,
        onclone: (clonedDoc) => {
          // Remove all existing stylesheets that might contain lab() colors
          const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
          stylesheets.forEach(sheet => sheet.remove());
          
          // Add only safe inline styles
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f3f4f6;
              color: #000000;
            }
            .itinerary-container {
              padding: 24px;
              background-color: #f3f4f6;
              min-height: 100vh;
            }
            .header-title {
              font-size: 30px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #000000;
            }
            .header-info {
              color: #1f2937;
              margin-bottom: 16px;
            }
            .header-duration {
              color: #374151;
              margin-bottom: 24px;
            }
            .day-block {
              margin-bottom: 24px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 16px;
              background-color: #e5e7eb;
            }
            .day-title {
              font-weight: 600;
              margin-bottom: 12px;
              color: #000000;
            }
            .activity-card {
              background-color: #d1d5db;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #9ca3af;
              margin-bottom: 12px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .activity-title {
              font-weight: 600;
              color: #000000;
              margin-bottom: 4px;
            }
            .activity-info {
              font-size: 14px;
              color: #1f2937;
              margin-bottom: 4px;
            }
            .activity-links {
              font-size: 14px;
              margin-top: 4px;
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 8px;
            }
            .activity-contact {
              font-size: 14px;
              color: #374151;
              margin-top: 4px;
            }
            .map-link {
              color: #15803d;
              text-decoration: underline;
            }
            .pdf-link {
              color: #1d4ed8;
              text-decoration: underline;
              margin-right: 8px;
            }
            .separator {
              color: #000000;
            }
            .no-activities {
              font-style: italic;
              color: #4b5563;
            }
            .font-medium {
              font-weight: 500;
            }
            .font-semibold {
              font-weight: 600;
            }
            .font-bold {
              font-weight: bold;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Apply classes directly as inline styles to ensure they work
          const applyInlineStyles = (element) => {
            if (element.classList) {
              if (element.classList.contains('itinerary-container')) {
                element.style.cssText = 'padding: 24px; background-color: #f3f4f6; min-height: 100vh;';
              }
              if (element.classList.contains('header-title')) {
                element.style.cssText = 'font-size: 30px; font-weight: bold; margin-bottom: 8px; color: #000000;';
              }
              if (element.classList.contains('header-info')) {
                element.style.cssText = 'color: #1f2937; margin-bottom: 16px;';
              }
              if (element.classList.contains('header-duration')) {
                element.style.cssText = 'color: #374151; margin-bottom: 24px;';
              }
              if (element.classList.contains('day-block')) {
                element.style.cssText = 'margin-bottom: 24px; border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; background-color: #e5e7eb;';
              }
              if (element.classList.contains('day-title')) {
                element.style.cssText = 'font-weight: 600; margin-bottom: 12px; color: #000000;';
              }
              if (element.classList.contains('activity-card')) {
                element.style.cssText = 'background-color: #d1d5db; padding: 12px; border-radius: 8px; border: 1px solid #9ca3af; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);';
              }
              if (element.classList.contains('activity-title')) {
                element.style.cssText = 'font-weight: 600; color: #000000; margin-bottom: 4px;';
              }
              if (element.classList.contains('activity-info')) {
                element.style.cssText = 'font-size: 14px; color: #1f2937; margin-bottom: 4px;';
              }
              if (element.classList.contains('activity-links')) {
                element.style.cssText = 'font-size: 14px; margin-top: 4px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px;';
              }
              if (element.classList.contains('activity-contact')) {
                element.style.cssText = 'font-size: 14px; color: #374151; margin-top: 4px;';
              }
              if (element.classList.contains('map-link')) {
                element.style.cssText = 'color: #15803d; text-decoration: underline;';
              }
              if (element.classList.contains('pdf-link')) {
                element.style.cssText = 'color: #1d4ed8; text-decoration: underline; margin-right: 8px;';
              }
              if (element.classList.contains('no-activities')) {
                element.style.cssText = 'font-style: italic; color: #4b5563;';
              }
            }
            
            // Recursively apply to children
            for (let child of element.children) {
              applyInlineStyles(child);
            }
          };
          
          applyInlineStyles(clonedDoc.body);
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(190 / imgWidth, 280 / imgHeight); // A4 page margins
      const pdfWidth = imgWidth * ratio;
      const pdfHeight = imgHeight * ratio;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.height;
      
      let position = 0;
      const margin = 10;

      // Add the image to PDF
      pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);

      // Add clickable links for maps and PDFs - Enhanced version
      const links = element.querySelectorAll('a[href]');
      const elementRect = element.getBoundingClientRect();
      
      links.forEach((link) => {
        const rect = link.getBoundingClientRect();
        
        // Calculate position relative to the content element
        const relativeX = rect.left - elementRect.left;
        const relativeY = rect.top - elementRect.top;
        
        // Convert to PDF coordinates with proper scaling
        const pdfX = (relativeX / elementRect.width) * pdfWidth + margin;
        const pdfY = (relativeY / elementRect.height) * pdfHeight + margin;
        const pdfLinkWidth = (rect.width / elementRect.width) * pdfWidth;
        const pdfLinkHeight = (rect.height / elementRect.height) * pdfHeight;
        
        // Ensure link is within the visible area
        if (pdfY >= margin && pdfY <= pdfHeight + margin) {
          try {
            pdf.link(pdfX, pdfY, pdfLinkWidth, pdfLinkHeight, { url: link.href });
          } catch (error) {
            console.warn('Failed to add link annotation:', error);
          }
        }
      });

      // Handle multi-page PDFs if content is too long
      if (pdfHeight > pageHeight - 2 * margin) {
        pdf.deletePage(1); // Remove the first page we added
        
        let yOffset = 0;
        const maxPageHeight = pageHeight - 2 * margin;
        
        while (yOffset < pdfHeight) {
          if (yOffset > 0) {
            pdf.addPage();
          }
          
          // Add image section for this page
          pdf.addImage(
            imgData, 
            'PNG', 
            margin, 
            margin - yOffset, 
            pdfWidth, 
            pdfHeight
          );
          
          // Add links for this page section
          links.forEach((link) => {
            const rect = link.getBoundingClientRect();
            const relativeX = rect.left - elementRect.left;
            const relativeY = rect.top - elementRect.top;
            
            const pdfX = (relativeX / elementRect.width) * pdfWidth + margin;
            const pdfY = (relativeY / elementRect.height) * pdfHeight + margin - yOffset;
            const pdfLinkWidth = (rect.width / elementRect.width) * pdfWidth;
            const pdfLinkHeight = (rect.height / elementRect.height) * pdfHeight;
            
            // Only add links that are visible on this page
            if (pdfY >= margin && pdfY <= maxPageHeight + margin) {
              try {
                pdf.link(pdfX, pdfY, pdfLinkWidth, pdfLinkHeight, { url: link.href });
              } catch (error) {
                console.warn('Failed to add link annotation:', error);
              }
            }
          });
          
          yOffset += maxPageHeight;
        }
      }

      // Save the PDF
      const fileName = `${trip.trip_name || 'itinerary'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!trip) {
    return <div className="p-6 bg-gray-100 min-h-screen">Loading itinerary...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Content to be converted to PDF */}
      <div id="itinerary-content" className="itinerary-container p-6 bg-gray-100">
        {/* Header with inline Download Button */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="header-title text-3xl font-bold mb-2 text-black">{trip.trip_name}</h1>
            <p className="header-info text-gray-800 mb-4">
              Client: <span className="font-medium text-black">{clientName}</span> | Agency:{" "}
              <span className="font-medium text-black">{agencyName}</span>
            </p>
            <p className="header-duration text-gray-700">
              Duration: {trip.start_date} → {trip.end_date}
            </p>
          </div>
          
          {/* Download Button - positioned on the right */}
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2 flex-shrink-0"
          >
            {isGeneratingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating PDF...
              </>
            ) : (
              <>
                📄 PDF(Desktop)
              </>
            )}
          </button>
        </div>

        {/* Day blocks */}
        {days.map((day, idx) => (
          <div key={day} className="day-block mb-6 border border-gray-300 rounded p-4 bg-gray-200">
            <h2 className="day-title font-semibold mb-3 text-black">
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
                      className="activity-card bg-gray-300 p-3 rounded border border-gray-400 shadow-sm"
                    >
                      <p className="activity-title font-semibold text-black">{act.title}</p>
                      <p className="activity-info text-sm text-gray-800">
                        {vendorName} | {vendorType} | {act.time}
                      </p>

                      <div className="activity-links text-sm mt-1 flex flex-wrap items-center gap-2">
                        {/* Google Maps Link */}
                        {act.maps_link && (
                          <a
                            href={act.maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="map-link text-green-700 underline hover:text-green-800"
                          >
                            📍 View on Map
                          </a>
                        )}

                        {/* Separator if both exist */}
                        {act.maps_link && act.pdf_urls && act.pdf_urls.length > 0 && (
                          <span className="separator text-black">|</span>
                        )}

                        {/* Show PDFs as links */}
                        {act.pdf_urls && act.pdf_urls.length > 0 && (
                          <span className="text-blue-700">
                            {act.pdf_urls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pdf-link underline mr-2 hover:text-blue-800"
                              >
                                PDF {idx + 1}
                              </a>
                            ))}
                          </span>
                        )}
                      </div>

                      <p className="activity-contact text-sm text-gray-700 mt-1">
                        Contact: {act.contact_name} | {act.contact_phone}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="no-activities italic text-gray-600">
                  No activities planned for this day.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SharePreviewPage() {
  return (
    <Suspense fallback={<div className="p-6 bg-gray-100 min-h-screen">Loading preview...</div>}>
      <SharePreviewContent />
    </Suspense>
  );
}