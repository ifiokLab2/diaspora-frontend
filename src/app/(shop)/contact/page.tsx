'use client'
import api from "@/lib/api";
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Plus, MessageSquare, Clock,Minus, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
const faqData = [
  {
    question: "How do I post a listing?",
    answer: "Once you're logged in, click the 'Post New Listing' button in the header or your dashboard. Fill in the details, upload your images, and hit save!"
  },
  {
    question: "Is it free to use the platform?",
    answer: "Basic listings are completely free. We offer 'Featured' slots for a small fee if you want your item to stay at the top of the search results."
  },
  {
    question: "How do I contact a seller?",
    answer: "Each listing page has a 'Contact Seller' button. You can send them a direct message or view their phone number if they've made it public."
  },
  {
    question: "What should I do if I suspect a scam?",
    answer: "Safety first! Use the 'Report' button on the listing page. Never send money via bank transfer before seeing the item in person."
  }
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
   subject: 'General Inquiry',
    message: ''
  });

 
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };


    const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/contact-us/", formData);
      
      // axios (api) already parses JSON, so response.data is available
      if (response.status === 200 || response.status === 201) {
        toast.success("Message sent! We'll get back to you shortly.");
        
        // 2. Reset form but keep 'General Inquiry' as the default subject
        setFormData({ 
          name: '', 
          email: '', 
          subject: 'General Inquiry', 
          message: '' 
        }); 
      } else {
        toast.error("Something went wrong. Please check your details.");
      }
    } catch (error: any) {
      // Check if the backend sent specific validation errors
      const serverMessage = error.response?.data?.email 
        ? "Invalid email address." 
        : "Could not connect to the server.";
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-16 lg:py-24">
      <div className="container mx-auto py-2 px-[6%] mt-10">
        
        {/* Header Section */}
        <div className="max-w-2xl mb-16">
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 mb-6">
            Get in touch <span className="text-blue-600">.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Have questions about a Product, listings or need help with your account? Our team is here to help you navigate the marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email us</h3>
                  <p className="text-slate-500 text-sm">support@mymarket.com</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Call us</h3>
                  <p className="text-slate-500 text-sm">+234 (0) 800 123 4567</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Business Hours</h3>
                  <p className="text-slate-500 text-sm">Mon — Fri, 9am — 6pm</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">Our Office</h3>
                <div className="flex gap-2 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <p>123 Marketplace Ave, Victoria Island, Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-8">
            <form 
              onSubmit={handleSubmit} 
              className="bg-white p-8 lg:p-12 rounded-3xl border border-slate-100 shadow-xl space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input 
                    type="text"
                    name = "name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
               <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all cursor-pointer"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Support & Help">Support & Help</option>
                  <option value="Billing Issues">Billing Issues</option>
                  <option value="Report a Listing">Report a Listing</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Message</label>
                <textarea 
                  required 
                  rows={6}
                  name = "message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white  rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:bg-slate-400"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

        </div>
        {/* --- FAQ SECTION --- */}
        <section className="mx-auto">
          <div className="text-center mt-20">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Quick answers to the questions we get most often.</p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800">{faq.question}</span>
                  {openFaq === index ? (
                    <Minus className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                <div 
                  className={`px-6 transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'pb-6 max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}