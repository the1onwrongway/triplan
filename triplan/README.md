# Triplan ✈️

> **Run Your Travel Agency Like a Pro**

Triplan is a modern, web-based platform designed specifically for travel agencies. It streamlines the process of creating beautiful, detailed trip itineraries, sharing them with clients, and managing agency operations. Triplan aims to evolve into a full-featured Customer Relationship Management (CRM) system for travel professionals.

## 🌟 Features

- **Create Beautiful Itineraries**: Build detailed and premium trip plans in minutes.
- **Client Sharing**: Easily share itineraries with clients via web links.
- **PDF Export**: Generate professional PDF versions of itineraries using integrated PDF tools.
- **Dashboard & Analytics**: Track your agency's performance and operations.
- **Vendor & Client Management**: Keep track of vendors and client profiles.
- **Modern Tech Stack**: Built for speed and reliability.

## 🚀 Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI/Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/) & [Firebase](https://firebase.google.com/)
- **PDF Generation**: `jspdf`, `html2pdf.js`, `html2canvas`
- **Icons**: `react-icons`, `lucide-react`
- **Animations**: `tw-animate-css`

## 📁 Project Structure

- `src/app/` - Next.js App Router pages and layouts.
  - `(protected)/` - Authenticated routes (Dashboard, Trips, Clients, Vendors, etc.)
  - `login/` - Authentication pages
  - `share_preview/` - Public facing itinerary sharing
  - `waitlist/` - Landing page waitlist
- `src/components/` - Reusable React components and UI elements.
- `src/lib/` - Utility functions and shared libraries.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📈 Roadmap

- [x] Itinerary Creation & Sharing
- [x] PDF Exports
- [ ] Advanced CRM Capabilities
- [ ] Vendor integrations and booking management

## 📄 License

This project is proprietary. All rights reserved.
