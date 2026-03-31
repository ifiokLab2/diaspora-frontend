"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  
  const currentRole = searchParams.get('role'); // e.g., 'seller'
  const requiredRole = searchParams.get('required'); // e.g., 'customer'

  // Helper to capitalize first letter
  const capitalize = (s: string | null) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "User";

  return (
    <div className="mt-23 bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-lg font-bold tracking-tighter sm:text-xl">
            Access Restricted
          </h1>
          <div className="bg-muted/50 p-4 rounded-lg border border-border mt-4">
            <p className="text-sm text-muted-foreground italic">
              "You are currently logged in as a <span className="font-bold text-foreground">{capitalize(currentRole)}</span>, 
              but this section is reserved exclusively for <span className="font-bold text-primary">{capitalize(requiredRole)}s</span>."
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={currentRole === 'seller' ? '/seller/dashboard' : '/'}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors w-full"
            >
              <Home className="h-4 w-4" />
              Back to {capitalize(currentRole)} Home
            </Link>
          </div>
          
          <button
            onClick={() => logout()}
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium border border-destructive/20 text-destructive hover:bg-destructive/5 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout & Switch Account
          </button>
        </div>

        <p className="text-xs text-muted-foreground pt-8">
          Need help? Contact support if you believe your account role is set incorrectly.
        </p>
      </div>
    </div>
  );
}