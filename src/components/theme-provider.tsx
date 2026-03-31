'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, storageKey, ...props }: ThemeProviderProps) {
  return <NextThemesProvider 
          attribute="class" 
          storageKey={storageKey} // Unique key for each section
          enableSystem={false}    // Disable system sync to keep them isolated
          {...props}
          >
          {children}
        </NextThemesProvider>
}
