"use client"
import AccountSidebar from "@/components/account-sidebar";
import Link from 'next/link';
import { Pencil } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import React, { useState, useEffect } from "react";
import api from "@/lib/api";

const Account = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

   
    useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await api.get("/auth/users/me/");

        setProfile(res.data);
      } catch (err) {
        //toast.error("Session expired. Please log in again.");
        //router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-yellow"></div>
        <p className="text-sm text-gray-500 italic">Syncing profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-2 px-[6%] mt-30 ">
      <div className="w-full flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        {/* main*/}

         <div className="flex-1 rounded-md border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h1 className="text-lg font-semibold text-foreground">Account Overview</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
            {/* Account Details */}
            <div className="rounded-md border border-border p-5">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">
                Account Details
              </h2>
              <p className="text-sm text-primary">{user?.first_name} {user?.last_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            {/* Address Book */}
            <div className="rounded-md border border-border p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Address Book
                </h2>
                <Link href = "/customer/address/create/" className="cursor-pointer text-muted-foreground hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </Link>
              </div>

              <p className="text-sm font-semibold text-foreground">Your default shipping address:</p>
              {profile?.address ?  (
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  <p className="text-foreground font-medium">{profile.address}</p>
                  <p>{profile.city_name}, {profile.country_name}</p>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground italic">No default shipping address set.</p>
                  <Link href="/customer/address/create/" className="mt-3 inline-block text-xs font-bold uppercase text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline">
                    +  Add Default Address
                  </Link>
                </div>
              )}
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
