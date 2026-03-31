"use client";

import { useState, use } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import api from '@/lib/api';

interface PageProps {
  params: Promise<{ uid: string; token: string }>;
}

export default function PasswordResetConfirm({ params }: PageProps) {
  const { uid, token } = use(params);
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== rePassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    setError("");

    try {
      // Matches standard Djoser endpoint: /auth/users/reset_password_confirm/
      await api.post('/auth/users/reset_password_confirm/', {
        uid,
        token: decodeURIComponent(token),
        new_password: password,
        re_new_password: rePassword
      });
      
      setSuccess(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => router.push('/login/customer'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Link expired or invalid. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-background px-8 py-10 shadow-xl border border-border/50">
        
        {success ? (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={56} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Password Reset!</h2>
            <p className="text-sm text-muted-foreground mt-3">
              Your password has been updated successfully. Redirecting you to login...
            </p>
            <Link href="/login/customer" className="mt-8 block text-sm font-bold text-brand hover:underline">
              Click here if not redirected
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">New Password</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Please enter and confirm your new secure password.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-2 p-3 text-xs font-medium text-red-600 bg-red-50 rounded-lg border border-red-100">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-transparent px-4 py-3.5 text-sm outline-none focus:border-foreground transition-all pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
              
                 <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm New Password"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-transparent px-4 py-3.5 text-sm outline-none focus:border-foreground transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

             

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-foreground py-4 text-sm font-bold text-background transition-all hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}