import { useQuery, useMutation, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { PostgrestError, RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from './client'
import type { Database } from './database.types'
import { useEffect } from 'react'

type TableName = keyof Database['public']['Tables']
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']

// Typen für Filter-Optionen
interface QueryFilter {
  [key: string]: string | number | boolean | null
}

// Typen für Realtime-Events
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

/**
 * Hook für das Abrufen von Daten aus einer Supabase-Tabelle
 */
export function useSupabaseQuery<T extends TableName>(
  tableName: T,
  options?: {
    select?: string
    filter?: QueryFilter
    queryOptions?: Omit<UseQueryOptions<TableRow<T>[], PostgrestError>, 'queryKey' | 'queryFn'>
  }
) {
  return useQuery({
    queryKey: [tableName, options?.filter],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      let query = supabase.from(tableName).select(options?.select || '*')

      // Füge Filter hinzu, falls vorhanden
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error } = await query

      if (error) throw error
      return data as unknown as TableRow<T>[]
    },
    ...options?.queryOptions,
  })
}

/**
 * Hook für das Einfügen von Daten in eine Supabase-Tabelle
 */
export function useSupabaseInsert<T extends TableName>(
  tableName: T,
  options?: UseMutationOptions<
    TableRow<T>,
    PostgrestError,
    TableInsert<T>
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newData: TableInsert<T>) => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from(tableName)
        .insert(newData)
        .select()
        .single()

      if (error) throw error
      return data as TableRow<T>
    },
    onSuccess: () => {
      // Invalidiere die Query nach erfolgreicher Mutation
      queryClient.invalidateQueries({ queryKey: [tableName] })
    },
    ...options,
  })
}

/**
 * Hook für das Aktualisieren von Daten in einer Supabase-Tabelle
 */
export function useSupabaseUpdate<T extends TableName>(
  tableName: T,
  options?: UseMutationOptions<
    TableRow<T>,
    PostgrestError,
    { id: string; data: TableUpdate<T> }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TableUpdate<T> }) => {
      const supabase = getSupabaseBrowserClient()
      const { data: updatedData, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return updatedData as TableRow<T>
    },
    onSuccess: () => {
      // Invalidiere die Query nach erfolgreicher Mutation
      queryClient.invalidateQueries({ queryKey: [tableName] })
    },
    ...options,
  })
}

/**
 * Hook für das Löschen von Daten aus einer Supabase-Tabelle
 */
export function useSupabaseDelete<T extends TableName>(
  tableName: T,
  options?: UseMutationOptions<void, PostgrestError, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidiere die Query nach erfolgreicher Mutation
      queryClient.invalidateQueries({ queryKey: [tableName] })
    },
    ...options,
  })
}

/**
 * Hook für das Abonnieren von Realtime-Updates einer Supabase-Tabelle
 */
export function useSupabaseSubscription<T extends TableName>(
  tableName: T,
  options?: {
    event?: RealtimeEvent
    filter?: string
  }
) {
  const queryClient = useQueryClient()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    let channel: RealtimeChannel | null = null
    let subscription: { unsubscribe: () => void } | null = null

    const setupSubscription = async () => {
      channel = supabase.channel(`public:${tableName}`)

      // Da die Supabase-Typen für Realtime noch nicht vollständig sind,
      // verwenden wir hier eine Typ-Assertion
      type ChannelWithPostgresChanges = {
        on(
          event: 'postgres_changes',
          filter: {
            event: RealtimeEvent
            schema: string
            table: string
            filter?: string
          },
          callback: () => void
        ): { subscribe: () => { unsubscribe: () => void } }
      }

      subscription = (channel as unknown as ChannelWithPostgresChanges)
        .on('postgres_changes', {
          event: options?.event || '*',
          schema: 'public',
          table: tableName,
          filter: options?.filter,
        }, () => {
          // Bei Änderungen die Query invalidieren
          queryClient.invalidateQueries({ queryKey: [tableName] })
        })
        .subscribe()
    }

    void setupSubscription()

    return () => {
      if (subscription) {
        void subscription.unsubscribe()
      }
      if (channel) {
        void channel.unsubscribe()
      }
    }
  }, [tableName, options?.event, options?.filter, queryClient, supabase])
}
