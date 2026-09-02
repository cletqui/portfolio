import { secureHeaders, NONCE } from "hono/secure-headers";
import { useRequestContext } from "hono/jsx-renderer";
import type { Context } from "hono";

export const nonce = (c: Context): string => c.get("secureHeadersNonce") ?? "";

export const useNonce = (): string => nonce(useRequestContext());

export const securityHeaders = secureHeaders({
  strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
  xFrameOptions: "DENY",
  referrerPolicy: "strict-origin-when-cross-origin",
  crossOriginEmbedderPolicy: false,
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
    magnetometer: [],
    gyroscope: [],
    accelerometer: [],
    browsingTopics: [],
  },
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    fontSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https://api.dicebear.com"],
    scriptSrc: [NONCE, "'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'"],
    frameSrc: ["https://www.openstreetmap.org"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    objectSrc: ["'none'"],
    manifestSrc: ["'self'"],
    upgradeInsecureRequests: [],
  },
});
