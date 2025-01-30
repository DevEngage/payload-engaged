import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Props {
  supabaseUrl: string
  supabaseKey: string
  tableName: string
}

export const SupabaseRealtime: React.FC<Props> = ({ supabaseUrl, supabaseKey, tableName }) => {
  const [realtimeData, setRealtimeData] = useState<any[]>([])
  const supabase = createClient(supabaseUrl, supabaseKey)

  useEffect(() => {
    const channel = supabase
      .channel('table_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log('Change received!', payload)
          // Handle the realtime update
          if (payload.eventType === 'INSERT') {
            setRealtimeData((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'DELETE') {
            setRealtimeData((prev) => prev.filter((item) => item.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setRealtimeData((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item)),
            )
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tableName])

  return (
    <div>
      <h3>Realtime Updates</h3>
      <pre>{JSON.stringify(realtimeData, null, 2)}</pre>
    </div>
  )
}
