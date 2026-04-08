"use client"
import { useState, useMemo } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  endIcon?: React.ReactNode;
  required?: boolean;
}

const FloatingInput = ({ id, label, type = "text", value, onChange, endIcon, required }: FloatingInputProps) => {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div className={`relative rounded-lg border transition-colors ${focused ? "border-foreground" : "border-input"}`}>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-lg bg-transparent px-3 py-2 text-sm text-foreground outline-none"
        style={{ paddingRight: endIcon ? "2.5rem" : undefined }}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-3 bg-background px-1 transition-all duration-200 ${
          isActive ? "-top-2.5 text-xs text-muted-foreground" : "top-2 text-sm text-muted-foreground"
        }`}
      >
        {label}
      </label>
      {endIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{endIcon}</div>}
    </div>
  );
};


const CustomerSignup =  () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
   const [passwordMismatch, setPasswordMismatch] = useState(false);
  
  const { login } = useAuth();

  // --- Real-time Password Strength Logic ---
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: "", color: "bg-gray-200" };
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const mapping = [
      { label: "Very Weak", color: "bg-red-500" },
      { label: "Weak", color: "bg-orange-500" },
      { label: "Fair", color: "bg-yellow-500" },
      { label: "Good", color: "bg-blue-500" },
      { label: "Strong", color: "bg-green-500" },
    ];
    return { score, ...mapping[score - 1] };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordMismatch(false);

    // Validations
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/customer/register/', {
        email,
        first_name: firstName,
        last_name: lastName,
        password
      });

      setSuccess(true);
      
        await login({ email, password }, 'customer');
      

    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex mt-12 md:mt-26 min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm rounded-xl bg-background px-8 py-6 shadow-lg">
        <h1 className="text-center text-xl font-bold text-foreground">Welcome</h1>
        <p className="mt-1 text-center text-sm text-brand">Sign up to DiasporaBlack</p>
        {error && (
          <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 italic">
            <AlertCircle size={18} />
            <span>
            {error}
            {!passwordMismatch && (
        <Link 
          href={error.endsWith("seller") ? "/login/seller/" : "/login/customer/"} 
          className="ml-2 text-blue-500 font-semibold underline not-italic"
        >
          Login here
        </Link>
      )}
            </span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-100">
            <CheckCircle2 size={18} />
            <span>Success! Logging you in...</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <FloatingInput id="email" label="Email" type="email" value={email} onChange={setEmail} required />
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput id="firstName" label="First name" value={firstName} onChange={setFirstName} required />
            <FloatingInput id="lastName" label="Last name" value={lastName} onChange={setLastName} required />
          </div>

          <div className="space-y-1">
            <FloatingInput
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              required
              endIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            {/* Strength Meter UI */}
            {password.length > 0 && (
              <div className="px-1 pt-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div 
                      key={step} 
                      className={`h-full w-full rounded-full transition-colors duration-500 ${
                        step <= strength.score ? strength.color : "bg-gray-200"
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-[10px] mt-1 font-medium text-muted-foreground uppercase tracking-wider">
                  Strength: {strength.label}
                </p>
              </div>
            )}
          </div>

          <FloatingInput
            id="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            endIcon={
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 mt-4"
          >
            {loading ? "Creating Account..." : "Continue"}
          </button>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link href="/login/customer/" className="font-medium text-brand hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CustomerSignup;
