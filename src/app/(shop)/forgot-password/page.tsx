"use client";

import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from 'next/link';
import api from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Replace with your Django endpoint (e.g., djoser or custom)
      await api.post('/auth/users/reset_password/', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError("If an account exists with this email, a reset link has been sent.");
      // We usually show success even if email doesn't exist for security (anti-enumeration)
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-background px-8 py-10 shadow-xl border border-border/50">
        
        {!submitted ? (
          <>
            <div className="mb-6">
              <Link href="/login/customer" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft size={14} className="mr-1" /> Back to Login
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-transparent px-4 py-3.5 text-sm outline-none focus:border-foreground transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-foreground py-4 text-sm font-bold text-background transition-all hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. 
              Please check your inbox and spam folder.
            </p>
            <Link 
              href="/login/customer" 
              className="mt-8 block w-full rounded-xl border border-input py-3.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}