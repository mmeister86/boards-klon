import { QueryClient, isServer, Query } from '@tanstack/react-query'

/**
 * Erstellt einen neuen QueryClient mit optimierten Einstellungen für SSR und Caching
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Verhindert sofortiges Neuladen nach der Hydration
        staleTime: 60 * 1000, // 1 Minute
        // Caching-Dauer im Hintergrund
        gcTime: 5 * 60 * 1000, // 5 Minuten
        // Retry-Strategie für fehlgeschlagene Requests
        retry: 1,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Keine Retries für Mutations (Schreiboperationen)
        retry: false,
      },
      dehydrate: {
        // Inkludiert auch pending Queries in der Hydration
        shouldDehydrateQuery: (query: Query) => {
          return query.state.status === 'pending' || query.state.status === 'success'
        },
        // Fehlerbehandlung für Next.js
        // Wir lassen Next.js die Fehlerbehandlung übernehmen
        shouldRedactErrors: () => false,
      },
    },
  })
}

// Singleton-Pattern für Browser-Umgebung
let browserQueryClient: QueryClient | undefined = undefined

/**
 * Gibt einen QueryClient zurück, der für die aktuelle Umgebung optimiert ist
 */
export function getQueryClient() {
  if (isServer) {
    // Server: Immer einen neuen QueryClient erstellen
    return makeQueryClient()
  } else {
    // Browser: QueryClient wiederverwenden oder neu erstellen
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}
