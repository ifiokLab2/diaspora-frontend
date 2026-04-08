"use client"
import { useState } from "react";
import { Eye, EyeOff ,LogIn, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { setCookie } from 'cookies-next'; // Install via: npm install cookies-next


interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  endIcon?: React.ReactNode;
  required?: boolean; // Add this
}

const FloatingInput = ({ id, label, type = "text", value, onChange, endIcon,required }: FloatingInputProps) => {
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
          isActive
            ? "-top-2.5 text-xs text-muted-foreground"
            : "top-2 text-sm text-muted-foreground"
        }`}
      >
        {label}
      </label>
      {endIcon && (
        <div className="absolute right-3 top-5 -translate-y-1/2">{endIcon}</div>
      )}
    </div>
  );
};

const CustomerLogin =  () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [accountExist, setAccountExist] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Where to send the user after successful login
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return; // Stop the function here
    }
    setLoading(true);

    try {
      // 1. Call the login function from AuthContext
      await login({ email, password }, 'customer');
      

      // 2. Set cookie for the Middleware (Server-side access)
      // Note: AuthContext handles localStorage, this handles Middleware
      //const token = localStorage.getItem('accessToken');
      //if (token) {
       // setCookie('accessToken', token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
      //}

      //router.push(callbackUrl);
      //router.refresh(); // Force refresh to update server components
    } catch (error: any) {

       console.log('err*:',error);
        setAccountExist(error.exist)
        setError(error.error || 'Invalid credentials for customer account.');
      //setError(error.response?.data?.error || 'Invalid credentials for customer account.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex  md:mt-7 min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm rounded-xl bg-background px-8 py-6 shadow-lg">
        <h1 className="text-center text-xl font-bold text-foreground">Welcome</h1>
        <p className="mt-1 text-center text-sm text-brand">Login to DiasporaBlack</p>
        {error && (
          
          <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 italic">
            <AlertCircle size={18} />
            <span className="text-xs">
            {error}   
             
              {accountExist && (
              <>
              <Link href={error.endsWith("seller") ? "/login/seller/" : "/login/customer/"}  className="ml-1 text-blue-500 underline">
                  Login here
              </Link>
                
              </>

            )}
            </span>

          </div>
            
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <FloatingInput 
            id="email"
             label="Email" 
             type="email"
              value={email} 
              required 
              onChange={setEmail}
             />
          
          <FloatingInput
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            required
            endIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            disabled={loading}
            className="cursor-pointer w-full rounded-lg bg-foreground py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
           {loading ? (
              "Signing in..."
            ) : (
              <>
               
                Sign In
              </>
            )}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup/customer/" className="font-medium text-brand hover:underline">
              Signup
            </Link>
          </p>
          <p className="text-gray-600">Not a customer? <Link href="/login/seller" className="text-indigo-600 font-semibold hover:underline">Seller Login</Link></p>
        </form>
      </div>
    </div>
  );
};

export default CustomerLogin;
