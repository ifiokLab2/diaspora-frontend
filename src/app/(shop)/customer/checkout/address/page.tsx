"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import CartSummary from "@/components/cart-summary";
import { useRouter, useSearchParams } from "next/navigation";

const FloatingInput = ({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const safeValue = value ?? "";
  const hasValue = safeValue.length > 0;

  return (
    <div className="relative">
      <input
        type="text"
        name={name}
        value={safeValue}
        onChange={onChange}
        placeholder=" "
        className={`peer w-full rounded border bg-transparent px-3 pt-4 pb-2 text-sm text-foreground outline-none transition-colors
          ${hasValue ? "border-primary" : "border-input"}
          focus:border-primary-yellow`}
      />
      <label
        className={`pointer-events-none absolute left-2 -top-2.5 bg-card px-1 text-xs transition-all
          ${hasValue ? "text-primary" : "text-primary"}
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:bg-transparent
          peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary-yellow peer-focus:bg-card`}
      >
        {label}
      </label>
    </div>
  );
};

const FloatingSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: { id: string | number; name: string }[];
  disabled?: boolean;
}) => {
  const safeValue = value ?? "";
  const hasValue = safeValue !== "";

  return (
    <div className="relative">
      <label className={`absolute left-2 -top-2.5 bg-card px-1 text-xs z-10 transition-all
        ${hasValue ? "text-primary" : "text-muted-foreground"}`}
      >
        {label}
      </label>
      <select
        name={name}
        value={safeValue}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded border border-input bg-transparent px-3 pt-4 pb-2 text-sm text-foreground outline-none transition-colors focus:border-primary appearance-none cursor-pointer disabled:opacity-50"
      >
        <option value="">----------</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg className="h-4 w-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

const CheckoutAddress = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    phone_secondary: "",
    address: "",
    notes: "",
    country: "",
    city: "",
    gender: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('callbackUrl');

  const [countries, setCountries] = useState<{ id: number, name: string }[]>([]);
  const [cities, setCities] = useState<{ id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, geoRes] = await Promise.all([
          api.get("/auth/users/me/"),
          api.get("/locations/")
        ]);
        
        setCountries(geoRes.data.countries ?? []);

        if (profileRes.data) {
          setFormData({
            first_name: profileRes.data.first_name ?? "",
            last_name: profileRes.data.last_name ?? "",
            phone: profileRes.data.phone ?? "",
            phone_secondary: profileRes.data.phone_secondary ?? "",
            address: profileRes.data.address ?? "",
            notes: profileRes.data.notes ?? "",
            country: profileRes.data.country ?? "",
            city: profileRes.data.city ?? "",
            gender: profileRes.data.gender ?? "",
          });
        }
      } catch (err) {
        toast.error("Failed to load profile data");
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      if (!formData.country) {
        setCities([]);
        return;
      }
      try {
        const res = await api.get(`/locations/?country_id=${formData.country}`);
        setCities(res.data.cities ?? []);
      } catch (err) {
        setCities([]);
      }
    };
    loadCities();
  }, [formData.country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if ((name === "phone" || name === "phone_secondary") && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "country" ? { city: "" } : {}),
    }));
  };

  // VALIDATION LOGIC
  const validateForm = () => {
    const requiredFields = [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "phone", label: "Phone Number" },
      { key: "address", label: "Delivery Address" },
      { key: "country", label: "Country" },
      { key: "city", label: "City" },
      { key: "gender", label: "Gender" },
    ];

    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData]?.toString().trim()) {
        toast.error(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  // REUSABLE SAVE LOGIC
  const handleSaveData = async () => {
    if (!validateForm()) return false;

    setLoading(true);
    try {
      await api.patch("/auth/users/me/", formData);
      toast.success("Account details saved!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Update failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSaveData();
    if (success && redirectTarget) {
      router.push(redirectTarget);
    }
  };

  if (isFetching) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-yellow"></div>
        <p className="text-sm text-gray-500 italic">Syncing profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background mt-20 md:mt-30 py-2 px-[6%]">
      <div className="border-b bg-card h-2" />
      <div className="shadow-xl w-full px-6 py-8 flex lg:flex-row flex-col gap-8">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground mb-6">Account Overview</h1>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} />
              <FloatingInput label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="Phone Number *" name="phone" value={formData.phone} onChange={handleChange} />
              <FloatingInput label="Additional Phone Number" name="phone_secondary" value={formData.phone_secondary} onChange={handleChange} />
            </div>

            <FloatingInput label="Delivery Address *" name="address" value={formData.address} onChange={handleChange} />
            <FloatingInput label="Additional Information (Notes)" name="notes" value={formData.notes} onChange={handleChange} />

            <div className="grid grid-cols-2 gap-4">
              <FloatingSelect 
                label="Country *" 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                options={countries} 
              />
              <FloatingSelect 
                label="City *" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                options={cities} 
                disabled={!formData.country}
              />
            </div>

            <div className="max-w-[50%]">
              <FloatingSelect 
                label="Gender *" 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                options={[{id: "Male", name: "Male"}, {id: "Female", name: "Female"}]} 
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-primary-yellow cursor-pointer hover:bg-yellow-500 px-10 rounded text-sm font-semibold text-black transition-all"
              >
                {loading ? "Saving..." : "Save "}
              </Button>
            </div>
          </form>
        </div>

        <CartSummary onCheckoutAttempt={handleSaveData} />
      </div>
    </div>
  );
};

export default CheckoutAddress;