"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import AccountSidebar from "@/components/account-sidebar";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from 'next/navigation';

// --- UI Components ---

const FloatingInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
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
        required={required}
        placeholder=" "
        className={`peer w-full rounded border bg-transparent px-3 pt-4 pb-2 text-sm text-foreground outline-none transition-colors
          ${hasValue ? "border-primary" : "border-input"}
          focus:border-primary-yellow`}
      />
      <label
        className={`pointer-events-none absolute left-2 -top-2.5 bg-card px-1 text-xs transition-all
          text-primary
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:bg-transparent
          peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary-yellow peer-focus:bg-card`}
      >
        {label} {required && <span className="text-red-500">*</span>}
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
  required = false,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: { id: string | number; name: string }[];
  disabled?: boolean;
  required?: boolean;
}) => {
  const safeValue = value ?? "";
  const hasValue = safeValue !== "";

  return (
    <div className="relative">
      <label className={`absolute left-2 -top-2.5 bg-card px-1 text-xs z-10 transition-all
        ${hasValue ? "text-primary" : "text-muted-foreground"}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={safeValue}
        onChange={onChange}
        required={required}
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
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 pt-1">
        <svg className="h-4 w-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const AccountCreate = () => {
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

  const [countries, setCountries] = useState<{id: number, name: string}[]>([]);
  const [cities, setCities] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  // Mapping for user-friendly error messages
  const fieldLabels: Record<string, string> = {
    first_name: "First Name",
    last_name: "Last Name",
    phone: "Phone Number",
    address: "Delivery Address",
    country: "Country",
    city: "City",
    gender: "Gender",
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Specific Validation Check
    const requiredFields = ['first_name', 'last_name', 'phone', 'address', 'country', 'city', 'gender'];
    const missingFields = requiredFields
        .filter(field => !formData[field as keyof typeof formData])
        .map(field => fieldLabels[field]);

    if (missingFields.length > 0) {
      const fieldList = missingFields.join(", ");
      toast.error(`Please provide: ${fieldList}`);
      return;
    }

    setLoading(true);
    try {
      await api.patch("/auth/users/me/", formData);
      toast.success("Account updated successfully!");
      if (redirectPath) {
        router.push(decodeURIComponent(redirectPath));
      } else {
        router.push('/account');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-yellow"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background mt-20 md:mt-30 py-2 px-[6%]">
      <div className="border-b bg-card h-2" />
      <div className="w-full px-6 py-8 flex lg:flex-row flex-col gap-8">
        <AccountSidebar />

        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground mb-6">Account Overview</h1>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
              <FloatingInput label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
              <FloatingInput label="Additional Phone Number" name="phone_secondary" value={formData.phone_secondary} onChange={handleChange} />
            </div>

            <FloatingInput label="Delivery Address" name="address" value={formData.address} onChange={handleChange} required />
            <FloatingInput label="Additional Information (Optional)" name="notes" value={formData.notes} onChange={handleChange} />

            <div className="grid grid-cols-2 gap-4">
              <FloatingSelect 
                label="Country" 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                options={countries} 
                required 
              />
              <FloatingSelect 
                label="City" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                options={cities} 
                disabled={!formData.country}
                required 
              />
            </div>

            <div className="max-w-[50%]">
              <FloatingSelect 
                label="Gender" 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                options={[{id: "Male", name: "Male"}, {id: "Female", name: "Female"}]} 
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-primary-yellow cursor-pointer hover:bg-yellow-500 px-10 rounded text-sm font-semibold text-black transition-all"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountCreate;