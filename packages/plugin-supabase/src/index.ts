import type {
  CollectionConfig,
  CollectionSlug,
  Config,
  Config as PayloadConfig,
  Plugin,
} from 'payload'
import { createClient } from '@supabase/supabase-js'
// import { createClientServer } from './utils/createClientServer'

export interface SupabaseConfig {
  supabaseUrl: string
  supabaseKey: string
  /**
   * Enable Supabase Auth integration
   * @default false
   */
  auth?: {
    /**
     * Enable auth sync between Supabase and Payload
     * @default false
     */
    sync?: boolean
    /**
     * Collection to sync auth with (defaults to users)
     */
    collection?: string
    /**
     * Field mappings from Supabase User to Payload collection
     */
    fields?: {
      [key: string]: string
    }
    /**
     * Next.js auth configuration
     */
    next?: {
      /**
       * Enable Next.js middleware integration
       * @default false
       */
      middleware?: boolean
    }
  }
  /**
   * Enable Supabase Realtime integration
   * @default false
   */
  realtime?: boolean
  /**
   * Disable the plugin
   * @default false
   */
  disabled?: boolean
  /**
   * Collections to sync with Supabase
   */
  collections?: {
    [key: string]: {
      /**
       * Enable syncing this collection to Supabase
       */
      sync?: boolean
      /**
       * Supabase table name (defaults to collection slug)
       */
      tableName?: string
    }
  }
  // cookies?: any
}

export const supabasePlugin =
  (pluginOptions: SupabaseConfig): Plugin =>
  (incomingConfig: PayloadConfig): PayloadConfig => {
    const { disabled, auth } = pluginOptions
    const { logger } = incomingConfig
    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (disabled) {
      return incomingConfig
    }
    // @ts-ignore
    // logger?.info('supabasePlugin', pluginOptions)

    const supabase = createClient(
      pluginOptions.supabaseUrl,
      pluginOptions.supabaseKey,
      // pluginOptions.cookies,
    )

    // Initialize collections to sync
    const collections = incomingConfig.collections?.map((collection) => {
      const collectionConfig = pluginOptions.collections?.[collection.slug]
      const isAuthCollection = auth?.sync && collection.slug === (auth.collection || 'users')

      if (collectionConfig?.sync || isAuthCollection) {
        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
              async ({ doc, req }: any) => {
                // Sync document to Supabase
                const tableName = collectionConfig?.tableName || collection.slug

                if (isAuthCollection) {
                  // Map fields according to config
                  const mappedDoc = { ...doc }
                  if (auth?.fields) {
                    Object.entries(auth.fields).forEach(([supabaseField, payloadField]) => {
                      mappedDoc[supabaseField] = doc[payloadField]
                    })
                  }

                  // Update Supabase auth user
                  await supabase.auth.admin.updateUserById(doc.id, {
                    email: doc.email,
                    ...mappedDoc,
                  })
                } else {
                  await supabase.from(tableName).upsert({
                    id: doc.id,
                    ...doc,
                  })
                }
              },
              ...(collection.hooks?.afterChange || []),
            ],
            afterDelete: [
              async ({ id }: any) => {
                const tableName = collectionConfig?.tableName || collection.slug

                if (isAuthCollection) {
                  // Delete Supabase auth user
                  await supabase.auth.admin.deleteUser(id)
                } else {
                  await supabase.from(tableName).delete().eq('id', id)
                }
              },
              ...(collection.hooks?.afterDelete || []),
            ],
          },
          endpoints: [
            ...(collection.endpoints || []),
            isAuthCollection
              ? {
                  path: '/supabase-auth',
                  method: 'post',
                  handler: async (req: any, res: any) => {
                    if (!isAuthCollection) {
                      res.status(404).json({ error: 'Not found' })
                      return
                    }

                    const { event, session } = req.body

                    // Handle Supabase auth webhook events
                    switch (event) {
                      case 'SIGNED_IN': {
                        const { user } = session

                        // Create or update user in Payload
                        const mappedUser: any = {
                          email: user.email,
                        }

                        if (auth?.fields) {
                          Object.entries(auth.fields).forEach(([supabaseField, payloadField]) => {
                            mappedUser[payloadField] = user[supabaseField]
                          })
                        }

                        // Create/update Payload user and generate token
                        const payloadUser = await req.payload.create({
                          collection: collection.slug,
                          data: mappedUser,
                        })

                        // Generate Payload token
                        const payloadToken = await req.payload.login({
                          collection: collection.slug,
                          data: {
                            email: user.email,
                          },
                        })

                        // Set both tokens in cookies
                        res.setHeader('Set-Cookie', [
                          `supabase-auth-token=${session.access_token}; Path=/; HttpOnly`,
                          `payload-token=${payloadToken}; Path=/; HttpOnly`,
                        ])

                        break
                      }
                      case 'SIGNED_OUT': {
                        // Clear both tokens
                        res.setHeader('Set-Cookie', [
                          'supabase-auth-token=; Path=/; HttpOnly; Max-Age=0',
                          'payload-token=; Path=/; HttpOnly; Max-Age=0',
                        ])
                        break
                      }
                    }

                    res.json({ success: true })
                  },
                }
              : null,
          ].filter(Boolean),
        }
      }

      return collection
    })

    // Add Supabase client to payload context
    const config: PayloadConfig = {
      ...incomingConfig,
      collections: collections as CollectionConfig[],
      custom: {
        ...incomingConfig.custom,
        supabase,
      },
      admin: {
        ...incomingConfig.admin,
        custom: {
          ...incomingConfig.admin?.custom,
          //   supabase,
        },
      },
    }

    return config
  }
