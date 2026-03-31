"use client"
import { useState } from "react";
import { Eye, EyeOff,UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import AuthContext
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setCookie } from 'cookies-next';

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  endIcon?: React.ReactNode;
}

const FloatingInput = ({ id, label, type = "text", value, onChange, endIcon }: FloatingInputProps) => {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div
      className={`relative rounded-lg border transition-colors ${
        focused ? "border-foreground" : "border-input"
      }`}
    >
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-lg bg-transparent px-3 py-2 text-sm text-foreground outline-none"
        style={{ paddingRight: endIcon ? "2.5rem" : undefined }}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-3 bg-background px-1 transition-all duration-200 ${
          isActive
            ? "-top-2.5 text-xs text-muted-foreground"
            : "top-2 text-sm text-muted-foreground"
        }`}
      >
        {label}
      </label>
      {endIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{endIcon}</div>
      )}
    </div>
  );
};

const SellerSignup =  () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Destructure login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordMismatch(false);
    
    // Validation
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setError("Passwords do not match.");
      
      return;
    }

    setLoading(true);

    try {
      // POST request to Django
      await api.post('/auth/seller/register/', {
          email,          // matches email variable
          first_name: firstName,
          last_name: lastName,
          password
      });

      setSuccess(true);
      await login({ email, password }, 'seller');
      
      // Redirect to login after a brief success message
      /*setTimeout( async () => {
        //router.push('/login');
        await login({ email, password }, 'customer');
      }, 2000);*/

    } catch (err: any) {
      //const msg = err.response?.data?.detail || "Registration failed. Please check your details.";
      setError(err.response?.data?.error || "Registration failed. Try a different email.");
      //setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex mt-12 md:mt-26 min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm rounded-xl bg-background px-8 py-6 shadow-lg">
        <h1 className="text-center text-xl font-bold text-foreground">Welcome</h1>
        <p className="mt-1 text-center text-sm text-brand">Seller Signup</p>
        {error && (
          <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 italic">
            <AlertCircle size={18} />
            <span>
            {error}
            {!passwordMismatch && (
               <Link href="/login/customer/" className="ml-2 text-blue-500 underline">
                       login
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

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <FloatingInput id="email" label="Email" type="email" value={email} onChange={setEmail} />
          <FloatingInput id="firstName" label="First name" value={firstName} onChange={setFirstName} />
          <FloatingInput id="lastName" label="Last name" value={lastName} onChange={setLastName} />
          <FloatingInput
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            endIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <FloatingInput
            id="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            endIcon={
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground hover:text-foreground">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <div className="flex justify-end">
            <Link 
              href="/forgot-password" 
              className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="cursor-pointer w-full rounded-lg bg-foreground py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
           {loading ? "Creating Account..." : (
              <>
               
                Continue
              </>
            )}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login/seller/" className="font-medium text-brand hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SellerSignup;
