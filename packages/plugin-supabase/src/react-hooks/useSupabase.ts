import { useEffect, useState, useCallback } from 'react'
import {
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  RealtimeChannelOptions,
  RealtimePostgresChangesFilter,
  SupabaseClient,
} from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

let client: SupabaseClient | null = null

export function useSupabase() {
  const [supabase] = useState(() => {
    if (!client) {
      client = createClient()
    }
    return client
  })

  useEffect(() => {
    return () => {
      // Cleanup Supabase client when component unmounts
      if (client) {
        client.auth.stopAutoRefresh()
      }
    }
  }, [])

  return supabase
}

type SystemChangesFilter = {
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  schema?: string
  table?: string
}

type RealtimeMessage<T = any> = {
  type: SystemChangesFilter['event']
  table: string
  record: T
  oldRecord?: T
  timestamp: number
}

export function useSupabaseRealtime<T = any>({
  topic,
  options,
  filters,
}: {
  topic: string
  options?: RealtimeChannelOptions
  filters: PostgresChangesFilter[]
}) {
  const supabase = useSupabase()
  const [messages, setMessages] = useState<RealtimeMessage<T>[]>([])
  const [channel] = useState(() => {
    return supabase.channel(topic, options)
  })

  useEffect(() => {
    // Create a new channel and subscribe to all specified filters
    const newChannel = channel

    // Subscribe to each filter
    filters.forEach((filter) => {
      newChannel.on('system', filter, (payload) => {
        setMessages((prev) => [
          ...prev,
          {
            type: payload.eventType as SystemChangesFilter['event'],
            table: payload.table,
            record: payload.new as T,
            oldRecord: payload.old as T,
            timestamp: Date.now(),
          },
        ])
      })
    })

    // Connect to the channel
    newChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to realtime channel:', topic)
      }
    })

    // Cleanup function
    return () => {
      newChannel.unsubscribe()
    }
  }, [channel, topic, JSON.stringify(filters)]) // Re-run if filters change

  // Function to clear all messages
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // Function to remove a specific message
  const removeMessage = useCallback((timestamp: number) => {
    setMessages((prev) => prev.filter((msg) => msg.timestamp !== timestamp))
  }, [])

  return {
    messages,
    channel,
    clearMessages,
    removeMessage,
  }
}

type PostgresChangesFilter = {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  schema: string
  table?: string | undefined
}

export function useCollectionRealtime<T = any>({
  topic,
  collectionName,
  options,
  filters,
  defaultList = [],
  debug = false,
  transform = (item: any) => item,
}: {
  topic: string
  collectionName: string
  options?: RealtimeChannelOptions
  filters?: RealtimePostgresChangesFilter<`${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL}`>[]
  defaultList?: T[]
  debug?: boolean
  transform?: (item: any) => T
}) {
  const supabase = useSupabase()
  const [list, setList] = useState<T[]>(defaultList)
  const [channel] = useState(() => {
    return supabase.channel(topic, options)
  })

  filters ??= filters ?? [
    {
      event: '*',
      schema: 'public',
      table: collectionName,
    },
  ]

  useEffect(() => {
    // Create a new channel and subscribe to all specified filters
    const newChannel = channel

    // Subscribe to each filter
    filters.forEach((filter) => {
      newChannel.on('postgres_changes', filter, (payload) => {
        if (debug) {
          console.log('postgres_changes', filter, payload)
        }
        if (payload.eventType === 'INSERT') {
          setList((prev) => [...prev, transform(payload.new)])
        } else if (payload.eventType === 'UPDATE') {
          setList((prev) =>
            prev.map((item: any) =>
              'id' in item && item.id === payload.new.id ? transform(payload.new) : item,
            ),
          )
        } else if (payload.eventType === 'DELETE') {
          setList((prev) => prev.filter((item: any) => item.id !== payload.old.id))
        }
      })
    })

    // Connect to the channel
    newChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to realtime channel:', topic)
      }
    })

    // Cleanup function
    return () => {
      newChannel.unsubscribe()
    }
  }, [channel, topic, JSON.stringify(filters)]) // Re-run if filters change

  // Function to clear all messages
  const clearList = useCallback(() => {
    if (debug) {
      console.log('clearList', list)
    }
    setList([])
  }, [])

  // Function to remove a specific message
  const removeItem = useCallback((id: number | string) => {
    if (debug) {
      console.log('removeItem', id)
    }
    setList((prev) => prev.filter((msg: any) => 'id' in msg && msg.id !== id))
  }, [])

  return {
    list,
    channel,
    clearList,
    removeItem,
  }
}

export function useChatRoom({
  roomId,
  options,
}: {
  roomId: string
  options?: RealtimeChannelOptions
}) {
  const supabase = useSupabase()
  const [messages, setMessages] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [channel] = useState(() => {
    return supabase.channel(`chat-room:${roomId}`, options)
  })

  useEffect(() => {
    // Subscribe to the chat room channel
    const newChannel = channel

    // Listen for new messages
    newChannel.on('broadcast', { event: 'message' }, (payload) => {
      if (payload.event === 'join') {
        setUsers((prev) => [...prev, payload.user])
      } else if (payload.event === 'leave') {
        setUsers((prev) => prev.filter((user) => user.id !== payload.user.id))
      } else if (payload.event === 'message') {
        setMessages((prev) => [...prev, payload])
      }
    })

    // Connect to the channel
    newChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to chat room:', roomId)
      }
    })

    // Cleanup function
    return () => {
      newChannel.unsubscribe()
    }
  }, [channel, roomId])

  // Function to send a message
  const sendMessage = useCallback(
    (message: string) => {
      channel.send({
        type: 'broadcast',
        event: 'message',
        payload: { content: message, timestamp: Date.now() },
      })
    },
    [channel],
  )

  const join = useCallback(
    (user: any) => {
      channel.track({ onlineAt: new Date().toISOString(), user })
      channel.send({
        type: 'broadcast',
        event: 'join',
        payload: { user },
      })
    },
    [channel],
  )

  const leave = useCallback(
    (user: any) => {
      channel.untrack()
      channel.send({
        type: 'broadcast',
        event: 'leave',
        payload: { userId: user.id },
      })
    },
    [channel],
  )

  return {
    messages,
    sendMessage,
    users,
    join,
    leave,
  }
}

export function usePresence({
  roomId,
  options,
  filter,
}: {
  roomId: string
  options?: RealtimeChannelOptions
  filter?: { event: `${REALTIME_PRESENCE_LISTEN_EVENTS.SYNC}` }
}) {
  const supabase = useSupabase()
  const [presenceState, setPresenceState] = useState<any[]>([])
  const [channel] = useState(() => {
    return supabase.channel(`presence-room:${roomId}`, options)
  })

  filter ??= { event: `${REALTIME_PRESENCE_LISTEN_EVENTS.SYNC}` }

  useEffect(() => {
    // Subscribe to the presence channel
    const newChannel = channel
    // SYNC = 'sync',
    // JOIN = 'join',
    // LEAVE = 'leave',
    // Listen for presence state changes
    newChannel.on('presence', filter, () => {
      console.log('Synced presence state: ', channel.presenceState())
    })

    // Connect to the channel
    newChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ onlineAt: new Date().toISOString() })
      }
    })

    // Cleanup function
    return () => {
      newChannel.unsubscribe()
    }
  }, [channel, roomId])

  // Function to update presence state
  const updatePresence = useCallback(
    (newState: any) => {
      channel.send({
        type: 'presence',
        event: 'state',
        payload: newState,
      })
    },
    [channel],
  )

  return {
    presenceState,
    updatePresence,
  }
}
