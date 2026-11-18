"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RegisterNGOPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    organizer: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.organizer || !form.email || !form.location || !form.date || !form.time) {
      toast.warning("Please fill all required fields!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register-ngo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: new Date(`${form.date}T${form.time}`),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Registration submitted successfully!");
        setSuccess(true);
      } else {
        toast.error(data.error || "Something went wrong. Please try again!");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8faf6] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-[#EAF3DE] rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ti ti-circle-check text-[#3B6D11] text-5xl"></i>
        </div>
        <h2 className="text-[#27500A] text-2xl font-semibold mb-2">Organization Registered!</h2>
        <p className="text-[#888780] text-sm mb-6">
          Your community drive has been published! It is now live on the community page.
        </p>
        <div className="bg-white border border-[#e0ead8] rounded-2xl p-5 mb-6 w-full max-w-xs text-left">
          <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">What happens next?</p>
          <div className="flex flex-col gap-3">
            {[
              { icon: "ti-mail", text: "You will receive a confirmation email" },
              { icon: "ti-check", text: "Your drive will be listed publicly" },
              { icon: "ti-users", text: "Users can join and donate points to your drive" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#EAF3DE] rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`ti ${item.icon} text-[#3B6D11] text-sm`}></i>
                </div>
                <p className="text-[#5F5E5A] text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => router.push("/community")}
          className="w-full max-w-xs bg-[#639922] hover:bg-[#3B6D11] text-white font-medium py-3 px-6 rounded-full transition-all"
        >
          Back to Community
        </button>
      </div>
    );
  }

  const fields = [
    { name: "name", label: "Organization / Drive Name", placeholder: "e.g. Green Delhi Initiative", type: "text", icon: "ti-building-community", required: true },
    { name: "organizer", label: "Organizer Name", placeholder: "e.g. Swachh Bharat NGO", type: "text", icon: "ti-user", required: true },
    { name: "email", label: "Contact Email", placeholder: "contact@ngo.org", type: "email", icon: "ti-mail", required: true },
    { name: "phone", label: "Phone Number", placeholder: "+91 98765 43210", type: "tel", icon: "ti-phone", required: false },
    { name: "website", label: "Website", placeholder: "https://yourngo.org", type: "url", icon: "ti-world", required: false },
    { name: "location", label: "Drive Location", placeholder: "e.g. Connaught Place, New Delhi", type: "text", icon: "ti-map-pin", required: true },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf6] px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/community")}
          className="w-8 h-8 bg-white border border-[#e0ead8] rounded-lg flex items-center justify-center hover:bg-[#f4f9ef] transition-all"
        >
          <i className="ti ti-arrow-left text-[#3B6D11] text-sm"></i>
        </button>
        <h1 className="text-[#27500A] text-xl font-semibold">Register Organization</h1>
      </div>

      {/* Info Card */}
      <div className="bg-[#EAF3DE] border border-[#c0dda0] rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ti ti-info-circle text-[#3B6D11] text-xl"></i>
          </div>
          <div>
            <p className="text-[#27500A] font-semibold text-sm">Register your Organization</p>
            <p className="text-[#5F5E5A] text-xs mt-1 leading-relaxed">
              NGOs, RWAs, schools, and community groups can register their cleanup drives here. Your drive will be visible to all CleanKart users.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4">

        {fields.map((field) => (
          <div key={field.name}>
            <label className="text-[#5F5E5A] text-xs font-medium mb-1.5 block">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <i className={`ti ${field.icon} text-[#639922] text-sm absolute left-4 top-1/2 -translate-y-1/2`}></i>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full bg-white border border-[#e0ead8] rounded-xl pl-10 pr-4 py-3 text-[#27500A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#639922] transition-colors text-sm"
              />
            </div>
          </div>
        ))}

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[#5F5E5A] text-xs font-medium mb-1.5 block">
              Date <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <i className="ti ti-calendar text-[#639922] text-sm absolute left-4 top-1/2 -translate-y-1/2"></i>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full bg-white border border-[#e0ead8] rounded-xl pl-10 pr-4 py-3 text-[#27500A] focus:outline-none focus:border-[#639922] transition-colors text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-[#5F5E5A] text-xs font-medium mb-1.5 block">
              Time <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <i className="ti ti-clock text-[#639922] text-sm absolute left-4 top-1/2 -translate-y-1/2"></i>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full bg-white border border-[#e0ead8] rounded-xl pl-10 pr-4 py-3 text-[#27500A] focus:outline-none focus:border-[#639922] transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-[#5F5E5A] text-xs font-medium mb-1.5 block">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tell people about your drive — what will you clean, why it matters, what to bring..."
            rows={4}
            className="w-full bg-white border border-[#e0ead8] rounded-xl px-4 py-3 text-[#27500A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#639922] transition-colors text-sm resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#639922] hover:bg-[#3B6D11] disabled:opacity-40 text-white font-medium py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <i className="ti ti-loader-2 animate-spin text-sm"></i>
              Submitting...
            </>
          ) : (
            <>
              <i className="ti ti-send text-sm"></i>
              Register Organization
            </>
          )}
        </button>

        <p className="text-[#B4B2A9] text-xs text-center">
          Your drive will appear immediately on the community page
        </p>
      </div>
    </div>
  );
}