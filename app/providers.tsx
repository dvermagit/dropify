import {
  ThemeProvider as NextThemeProvider,
  ThemeProviderProps,
} from "next-themes";
import { ImageKitProvider } from "imagekitio-next";
import { HeroUIProvider } from "@heroui/react";
interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const authenticator = async () => {
  try {
    const response = await fetch("/api/imageKit-auth");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Authenticator error:", error);
    throw error;
  }
};
export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <h1>
      <ImageKitProvider
        authenticator={authenticator}
        publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
      >
        <HeroUIProvider>{children}</HeroUIProvider>
      </ImageKitProvider>
    </h1>
  );
}
