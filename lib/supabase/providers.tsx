"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";
import { getQueryClient } from "./query-client";

interface ProvidersProps {
  children: ReactNode;
  enableDevTools?: boolean;
}

/**
 * Provider-Komponente für React Query und andere globale Provider
 */
export function Providers({
  children,
  enableDevTools = process.env.NODE_ENV === "development",
}: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableDevTools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
