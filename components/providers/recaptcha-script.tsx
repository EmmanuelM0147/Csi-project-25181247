"use client";

import { useEffect } from "react";
import Script from "next/script";

export function ReCaptchaScript() {
  const handleError = (e: Error) => {
    console.error("reCAPTCHA failed to load:", e);
  };

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
      strategy="lazyOnload"
      onError={handleError}
    />
  );
}