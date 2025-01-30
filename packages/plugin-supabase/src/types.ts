export interface SupabasePluginConfig {
  supabaseUrl: string
  supabaseKey: string
  auth?: {
    enabled: boolean
    providers?: string[]
  }
  realtime?: {
    enabled: boolean
    tables?: string[]
  }
  collections?: {
    [key: string]: {
      sync?: boolean
      tableName?: string
    }
  }
}
