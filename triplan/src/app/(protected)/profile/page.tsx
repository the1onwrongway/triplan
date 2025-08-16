"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type ProfileForm = {
  agencyName: string;
  agencyAddress1: string;
  agencyAddress2: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  website: string;
  email: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<ProfileForm>({
    agencyName: "",
    agencyAddress1: "",
    agencyAddress2: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: "",
    website: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setUser(session.user);
      setForm((prev) => ({ ...prev, email: session.user.email ?? "" }));

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setForm({
          agencyName: profile.agency_name ?? "",
          agencyAddress1: profile.agency_address1 ?? "",
          agencyAddress2: profile.agency_address2 ?? "",
          city: profile.city ?? "",
          state: profile.state ?? "",
          pincode: profile.pincode ?? "",
          phoneNumber: profile.phone_number ?? "",
          website: profile.website ?? "",
          email: session.user.email ?? ""
        });
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Upsert profile
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          agency_name: form.agencyName,
          agency_address1: form.agencyAddress1,
          agency_address2: form.agencyAddress2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          phone_number: form.phoneNumber,
          website: form.website
        });

      if (upsertError) throw upsertError;

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex justify-center mt-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>

        <input type="text" name="agencyName" placeholder="Agency Name *" value={form.agencyName} onChange={handleChange} required className="w-full border p-2 rounded" />

        <div className="flex gap-4">
          <input type="text" name="agencyAddress1" placeholder="Address 1 *" value={form.agencyAddress1} onChange={handleChange} required className="flex-1 border p-2 rounded" />
          <input type="text" name="agencyAddress2" placeholder="Address 2 *" value={form.agencyAddress2} onChange={handleChange} required className="flex-1 border p-2 rounded" />
        </div>

        <div className="flex gap-4">
          <input type="text" name="city" placeholder="City *" value={form.city} onChange={handleChange} required className="flex-1 border p-2 rounded" />
          <input type="text" name="pincode" placeholder="Pincode *" value={form.pincode} onChange={handleChange} required className="flex-1 border p-2 rounded" />
          <input type="text" name="state" placeholder="State *" value={form.state} onChange={handleChange} required className="flex-1 border p-2 rounded" />
        </div>

        <div className="flex gap-4">
          <input type="text" name="phoneNumber" placeholder="Phone Number *" value={form.phoneNumber} onChange={handleChange} required className="flex-1 border p-2 rounded" />
          <input type="email" name="email" value={form.email} readOnly className="flex-1 border p-2 rounded bg-gray-100" />
          <input type="text" name="website" placeholder="Website" value={form.website} onChange={handleChange} className="flex-1 border p-2 rounded" />
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save</button>
      </form>
    </div>
  );
}