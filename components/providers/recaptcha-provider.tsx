"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
  // Get the current hostname for development/production environments
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
      // Add localhost to allowed domains in development
      container={{
        parameters: {
          badge: 'bottomright',
        },
        ...(isDevelopment && {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          actions: ['contact_form'],
          hostname: hostname,
        }),
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}