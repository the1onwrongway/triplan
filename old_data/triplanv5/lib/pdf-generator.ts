
'use client';

import jsPDF from 'jspdf';
import type { Trip } from './types';
import { format } from 'date-fns';
import { auth } from './firebase';

// A utility to safely get a data URL from an image, with a fallback.
async function getSafeImageDataUrl(url: string, fallback: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) return fallback;
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error fetching image for PDF:', error);
        return fallback;
    }
}

export const generatePdf = async (trip: Trip) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
    });

    const docWidth = doc.internal.pageSize.getWidth();
    const docHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = margin;

    // --- Header ---
    const agencyName = auth.currentUser?.displayName || "Triplan Agency";
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150, 150, 150);
    doc.text(agencyName.toUpperCase(), margin, y);

    y += 40;

    // --- Trip Title ---
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(trip.title, margin, y);
    y += 25;

    // --- Dates & Client ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const dateRange = `${format(trip.startDate, 'MMMM d, yyyy')} - ${format(trip.endDate, 'MMMM d, yyyy')}`;
    doc.text(dateRange, margin, y);
    y += 15;
    doc.text(`For: ${trip.clientName}`, margin, y);
    y += 30;

    // --- Line Separator ---
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, docWidth - margin, y);
    y += 30;


    // --- Itinerary Days ---
    for (const day of trip.days.sort((a, b) => a.dayIndex - b.dayIndex)) {
        if (y > docHeight - 120) {
            doc.addPage();
            y = margin;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(`Day ${day.dayIndex}: ${day.title}`, margin, y);
        y += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(format(day.date, 'EEEE, MMMM d'), margin, y);
        y += 25;
        
        for (const activity of day.activities) {
             if (y > docHeight - 80) {
                doc.addPage();
                y = margin;
            }

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(50, 50, 50);
            doc.text(`${activity.time ? `[${activity.time}] ` : ''}${activity.title}`, margin + 15, y);
            y += 15;

            if (activity.description) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80, 80, 80);
                const descLines = doc.splitTextToSize(activity.description, docWidth - margin * 2 - 15);
                doc.text(descLines, margin + 15, y);
                y += descLines.length * 12 + 5;
            }
            if (activity.locationName) {
                doc.setTextColor(120, 120, 120);
                doc.text(`Location: ${activity.locationName}`, margin + 15, y);
                y += 15;
            }
        }
        y += 20;
    }

    // --- Footer ---
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(agencyName, docWidth / 2, docHeight - 30, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, docWidth / 2, docHeight - 20, { align: 'center' });
    }


    doc.save(`${trip.title.replace(/ /g, '_')}_itinerary.pdf`);
};
