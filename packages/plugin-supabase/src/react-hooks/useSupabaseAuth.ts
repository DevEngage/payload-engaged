// import { useRouter } from 'next/navigation'
import { createClient, Provider } from '@supabase/supabase-js'
import { useCallback } from 'react'

export function useSupabaseAuth(router: any) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  // const router = useRouter()

  const signIn = useCallback(
    async (provider: Provider) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      return data
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router?.refresh()
  }, [supabase, router])

  return {
    supabase,
    signIn,
    signOut,
  }
}
