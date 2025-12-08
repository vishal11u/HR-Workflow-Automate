"use client";

import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === "undefined") return null;
          const cookies = document.cookie.split(";");
          for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split("=");
            if (cookieName === name) {
              return decodeURIComponent(cookieValue);
            }
          }
          return null;
        },
        set(name: string, value: string, options: any) {
          if (typeof document === "undefined") return;

          let cookie = `${name}=${encodeURIComponent(value)}`;

          if (options?.maxAge) {
            cookie += `; max-age=${options.maxAge}`;
          }
          if (options?.path) {
            cookie += `; path=${options.path}`;
          }
          if (options?.domain) {
            cookie += `; domain=${options.domain}`;
          }
          if (options?.sameSite) {
            cookie += `; samesite=${options.sameSite}`;
          }
          if (options?.secure) {
            cookie += "; secure";
          }

          document.cookie = cookie;
        },
        remove(name: string, options: any) {
          if (typeof document === "undefined") return;

          let cookie = `${name}=; max-age=0`;

          if (options?.path) {
            cookie += `; path=${options.path}`;
          }
          if (options?.domain) {
            cookie += `; domain=${options.domain}`;
          }

          document.cookie = cookie;
        },
      },
    }
  );
}
