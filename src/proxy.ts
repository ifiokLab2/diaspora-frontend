import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Retrieve the token, role, and profile status from Cookies
  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value; // 'customer' or 'seller'
  const hasProfile = request.cookies.get('hasProfile')?.value === 'true';

  // 2. Define Route Categories
  const isSellerRoute = pathname.startsWith('/seller/dashboard') || 
                        pathname.startsWith('/inventory');
                        
                        
  const isOnboardingRoute = pathname.startsWith('/onboarding');

  
  const isCustomerRoute = pathname.startsWith('/checkout') || 
                          pathname.startsWith('/profile');

const isSharedProtectedRoute = pathname.startsWith('/account') || 
                              pathname.startsWith('/save-later') ||
                              pathname.startsWith('/customer/checkout/address') ||
                              pathname.startsWith('/customer/address/create') ||
                              pathname.startsWith('/customer/account/orders');
                          
const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');



  // 3. Logic: If no token, redirect protected routes to login
//console.log('token:',token)
  if (!token) {
    const isAnyProtectedRoute = isSellerRoute || isCustomerRoute || isSharedProtectedRoute || isOnboardingRoute;
    if (isAnyProtectedRoute) {
      // Determine which login page to show based on the route type
      // Default to /login/customer for shared routes like /account
      const loginPath = isSellerRoute ? '/login/seller' : '/login/customer';
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }



  // 4. Logic: Role & Profile Authorization
  if (token && userRole) {
    
    // --- SELLER LOGIC ---
    if (userRole === 'seller') {
      // Force onboarding if profile is missing
      if (isSellerRoute && !hasProfile) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      
      // Prevent access to onboarding if already complete
      if (isOnboardingRoute && hasProfile) {
        return NextResponse.redirect(new URL('/seller/dashboard', request.url));
      }

      // Prevent Sellers from accessing Customer-only areas (like customer checkout)
      if (isCustomerRoute) {
        // Use redirect so the URL params are readable by the component
          const url = new URL('/unauthorized', request.url);
          url.searchParams.set('role', 'seller');
          url.searchParams.set('required', 'customer');
          return NextResponse.redirect(url);
        //return NextResponse.redirect(new URL('/seller/dashboard', request.url));
      }
    }

    // --- CUSTOMER LOGIC ---
    if (userRole === 'customer') {
      // Prevent Customers from accessing any Seller or Onboarding areas
      if (isSellerRoute || isOnboardingRoute) {
        const url = new URL('/unauthorized', request.url);
        url.searchParams.set('role', 'customer');
        url.searchParams.set('required', 'seller');
        return NextResponse.redirect(url);
        //return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // --- AUTH LOGIC ---
    // Prevent logged-in users from seeing Login/Register pages
    if (isAuthRoute) {
      const redirectPath = userRole === 'seller' ? (hasProfile ? 'seller/dashboard' : '/onboarding') : '/';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

// 5. Matcher Configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};