"use client";

import "./globals.css";
import { ErrorFallback } from "@/components/shared/error-fallback";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body>
        <ErrorFallback reset={reset} />
      </body>
    </html>
  );
}
