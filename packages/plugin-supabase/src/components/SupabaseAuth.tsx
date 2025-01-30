import React from 'react'
import { createClient } from '@supabase/supabase-js'

interface Props {
  supabaseUrl: string
  supabaseKey: string
}

export const SupabaseAuth: React.FC<Props> = ({ supabaseUrl, supabaseKey }) => {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const handleSupabaseLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    })

    if (error) {
      console.error('Supabase auth error:', error)
    }

    return data
  }

  return (
    <div>
      <button onClick={handleSupabaseLogin}>Login with GitHub</button>
    </div>
  )
}
