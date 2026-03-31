'use client'

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ReportModalProps {
  listingId: number;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Fraud or Scam",
  "Prohibited Item",
  "Duplicate Listing",
  "Incorrect Category",
  "Offensive Content",
  "Other"
];

export default function ReportModal({ listingId, listingTitle, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return toast.error("Please select a reason");

    setSubmitting(true);
    try {
      await api.post(`/listings/${listingId}/report/`, {
        reason,
        details,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to send report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="mt-20 bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            <h3 className="font-bold">Report Listing</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h4 className="text-xl font-bold">Thank You</h4>
              <p className="text-slate-500">Our moderators will review this listing shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-slate-500">
                You are reporting: <span className="font-bold text-slate-700">{listingTitle}</span>
              </p>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Reason for reporting</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason...</option>
                  {REPORT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Additional Details (Optional)</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 h-24 resize-none"
                  placeholder="Provide more context..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all disabled:bg-slate-300"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "Submit Report"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}