'use client';

import { ThemeProvider } from '@/context/ThemeContext';

export default function ThemeProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
} 