"use client";

import React from "react";
import { ErrorBoundary, ErrorBoundaryFallbackProps } from "./ErrorBoundary";
import { BaseError } from "../types";
import { useQueryClient } from "@tanstack/react-query";

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  queryKey: unknown[];
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: BaseError) => void;
}

/**
 * Error Boundary speziell für React Query
 * Behandelt Fehler in Query-Komponenten und bietet Query-spezifische Wiederherstellung
 */
export function QueryErrorBoundary({
  children,
  queryKey,
  fallback,
  onError,
}: QueryErrorBoundaryProps) {
  const queryClient = useQueryClient();

  // Standard-Fallback für Queries
  const DefaultQueryFallback = ({
    error,
    resetError,
  }: ErrorBoundaryFallbackProps) => (
    <div className="query-error-fallback" role="alert">
      <div className="query-error-content">
        <h3>Fehler beim Laden der Daten</h3>
        <p>{error.getUserMessage()}</p>
        <div className="query-error-actions">
          <button
            onClick={() => {
              // Invalidiere die Query und versuche es erneut
              queryClient.invalidateQueries({ queryKey });
              resetError();
            }}
            className="query-error-button"
          >
            Neu laden
          </button>
          {process.env.NODE_ENV === "development" &&
            error.getTechnicalDetails() && (
              <details className="query-error-details">
                <summary>Technische Details</summary>
                <pre>{error.getTechnicalDetails()}</pre>
              </details>
            )}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallback || DefaultQueryFallback}
      onError={(error) => {
        // Füge Query-Informationen zum Fehlerkontext hinzu
        error.metadata.context = {
          ...error.metadata.context,
          queryKey,
          queryKeyString: JSON.stringify(queryKey),
        };

        // Rufe den Error-Handler auf, falls vorhanden
        onError?.(error);
      }}
      onReset={() => {
        // Beim Zurücksetzen die Query invalidieren
        queryClient.invalidateQueries({ queryKey });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
