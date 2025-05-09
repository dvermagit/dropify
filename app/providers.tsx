"use client";

import {
  ThemeProvider as NextThemeProvider,
  ThemeProviderProps,
} from "next-themes";
import { ImageKitProvider } from "imagekitio-next";
import { HeroUIProvider } from "@heroui/react";
import { useEffect, useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const authenticator = async () => {
  try {
    const response = await fetch("/api/imageKit-auth");
    if (!response.ok) throw new Error("Auth failed");
    return await response.json();
  } catch (error) {
    console.error("Authenticator error:", error);
    throw error;
  }
};

export function Providers({ children, themeProps }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure we don't render until mounted to avoid hydration mismatches
  if (!mounted) return null;

  return (
    <ImageKitProvider
      authenticator={authenticator}
      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
    >
      <NextThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        {...themeProps}
      >
        <HeroUIProvider>{children}</HeroUIProvider>
      </NextThemeProvider>
    </ImageKitProvider>
  );
}
