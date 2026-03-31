'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { useCartStore } from '@/store/useCartStore';
import api from '@/lib/api';

interface User {
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'seller';
  hasShopProfile?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: object, role: 'customer' | 'seller') => Promise<void>;
  logout: () => void;
  updateProfileStatus: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  

  // On Mount: Rehydrate user state from LocalStorage & Cookie check
  useEffect(() => {
    const token = getCookie('accessToken');
    const storedUser = localStorage.getItem('user_data');
    //console.log('token && storedUser:',token , storedUser);
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        // If data is corrupt, clear it
        logout();
      }
    }
    setLoading(false);
  }, []);

  /**
   * login handles authentication and initial routing
   */
  const login = async (credentials: object, role: 'customer' | 'seller') => {
    try {
      const res = await api.post(`/auth/${role}/login/`, credentials);
      const { access, refresh, user: userData } = res.data;
      
      const cookieOptions = { maxAge: 60 * 60 * 24 * 7, path: '/' };
      const currentCallback = searchParams.get('callbackUrl');
      // Where to send the user after successful login
      //const callbackUrl = searchParams.get('callbackUrl');
      
      // 1. Set Cookies
      setCookie('accessToken', access, cookieOptions);
      setCookie('refreshToken', refresh, cookieOptions);
      setCookie('userRole', role, cookieOptions);
      router.refresh();
      
      // 2. Profile Status (Used by Middleware)
      const hasProfileStatus = userData.hasShopProfile ? 'true' : 'false';
      setCookie('hasProfile', hasProfileStatus, cookieOptions);

      // 3. Update Local Storage & State
      const fullUserData = { ...userData, role, hasShopProfile: userData.hasShopProfile };
      localStorage.setItem('user_data', JSON.stringify(fullUserData));
      setUser(fullUserData);
      console.log('Attempting redirect. callbackUrl:', currentCallback);
      
      // 4. Corrected Redirection Logic
      // Priority 1: Mandatory Onboarding for Sellers without profiles
      if (role === 'seller' && !userData.hasShopProfile) {
        router.push('/onboarding');
      } 

      // Priority 2: Use Callback URL if it exists
      else if (currentCallback) {
        // decodeURIComponent handles cases where the URL is encoded (e.g. %2Faccount)
        router.push(decodeURIComponent(currentCallback));
      } 
      // Priority 3: Role-based Default Home
      else {
        router.push(role === 'seller' ? '/seller/dashboard' : '/');
      }
      
      // Ensure the server components see the new cookies
      //router.refresh(); 
      
    } catch (error: any) {
      throw error.response?.data || error.message; 
    }
  };

  /**
   * updateProfileStatus: Call this after successful onboarding
   */
  const updateProfileStatus = () => {
    if (user) {
      const updatedUser = { ...user, hasShopProfile: true };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setCookie('hasProfile', 'true', { maxAge: 60 * 60 * 24 * 7, path: '/' });
    }
  };

  /**
   * logout clears all session data
   */
  const logout = () => {
    // Clear Cookies
    useCartStore.getState().reset();
    deleteCookie('accessToken', { path: '/' });
    deleteCookie('refreshToken', { path: '/' });
    deleteCookie('userRole', { path: '/' });
    deleteCookie('hasProfile', { path: '/' });
    
    // Clear LocalStorage
    localStorage.removeItem('user_data');
    
    // Reset State
    setUser(null);
    
    // Redirect
    router.push('/');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateProfileStatus,
      isAuthenticated: !!user 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};