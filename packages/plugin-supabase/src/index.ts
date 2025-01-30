import type { CollectionSlug, Config, Config as PayloadConfig, Plugin } from 'payload'
import { createClient } from '@supabase/supabase-js'

// export type MyPluginConfig = {
//   /**
//    * List of collections to add a custom field
//    */
//   collections?: Partial<Record<CollectionSlug, true>>
//   disabled?: boolean
// }

// export const myPlugin =
//   (pluginOptions: MyPluginConfig) =>
//   (config: Config): Config => {
//     if (!config.collections) {
//       config.collections = []
//     }

//     config.collections.push({
//       slug: 'plugin-collection',
//       fields: [
//         {
//           name: 'id',
//           type: 'text',
//         },
//       ],
//     })

//     if (pluginOptions.collections) {
//       for (const collectionSlug in pluginOptions.collections) {
//         const collection = config.collections.find(
//           (collection) => collection.slug === collectionSlug,
//         )

//         if (collection) {
//           collection.fields.push({
//             name: 'addedByPlugin',
//             type: 'text',
//             admin: {
//               position: 'sidebar',
//             },
//           })
//         }
//       }
//     }

//     /**
//      * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
//      * If your plugin heavily modifies the database schema, you may want to remove this property.
//      */
//     if (pluginOptions.disabled) {
//       return config
//     }

//     if (!config.endpoints) {
//       config.endpoints = []
//     }

//     if (!config.admin) {
//       config.admin = {}
//     }

//     if (!config.admin.components) {
//       config.admin.components = {}
//     }

//     if (!config.admin.components.beforeDashboard) {
//       config.admin.components.beforeDashboard = []
//     }

//     config.admin.components.beforeDashboard.push(
//       `plugin-package-name-placeholder/client#BeforeDashboardClient`,
//     )
//     config.admin.components.beforeDashboard.push(
//       `plugin-package-name-placeholder/rsc#BeforeDashboardServer`,
//     )

//     config.endpoints.push({
//       handler: () => {
//         return Response.json({ message: 'Hello from custom endpoint' })
//       },
//       method: 'get',
//       path: '/my-plugin-endpoint',
//     })

//     const incomingOnInit = config.onInit

//     config.onInit = async (payload) => {
//       // Ensure we are executing any existing onInit functions before running our own.
//       if (incomingOnInit) {
//         await incomingOnInit(payload)
//       }

//       const { totalDocs } = await payload.count({
//         collection: 'plugin-collection',
//         where: {
//           id: {
//             equals: 'seeded-by-plugin',
//           },
//         },
//       })

//       if (totalDocs === 0) {
//         await payload.create({
//           collection: 'plugin-collection',
//           data: {
//             id: 'seeded-by-plugin',
//           },
//         })
//       }
//     }

//     return config
//   }

export interface SupabaseConfig {
  supabaseUrl: string
  supabaseKey: string
  /**
   * Enable Supabase Auth integration
   * @default false
   */
  auth?: boolean
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
}

export const supabasePlugin =
  (pluginOptions: SupabaseConfig): Plugin =>
  (incomingConfig: PayloadConfig): PayloadConfig => {
    const { disabled } = pluginOptions

    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (disabled) {
      return incomingConfig
    }

    const supabase = createClient(pluginOptions.supabaseUrl, pluginOptions.supabaseKey)

    // Initialize collections to sync
    const collections = incomingConfig.collections?.map((collection) => {
      const collectionConfig = pluginOptions.collections?.[collection.slug]

      if (collectionConfig?.sync) {
        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
              async ({ doc }: any) => {
                // Sync document to Supabase
                const tableName = collectionConfig.tableName || collection.slug
                await supabase.from(tableName).upsert({
                  id: doc.id,
                  ...doc,
                })
              },
              ...(collection.hooks?.afterChange || []),
            ],
            afterDelete: [
              async ({ id }: any) => {
                // Delete document from Supabase
                const tableName = collectionConfig.tableName || collection.slug
                await supabase.from(tableName).delete().eq('id', id)
              },
              ...(collection.hooks?.afterDelete || []),
            ],
          },
        }
      }

      return collection
    })

    // Add Supabase client to payload context
    const config: PayloadConfig = {
      ...incomingConfig,
      collections,
      admin: {
        ...incomingConfig.admin,

        // globals: {
        //   ...incomingConfig.globals,
        // },
        // express: {
        //   ...incomingConfig.express,
        //   middleware: [
        //     ...(incomingConfig.express?.middleware || []),
        //     (req, _, next) => {
        //       // Add supabase client to req object
        //       req.supabase = supabase
        //       next()
        //     },
        //   ],
        // },

        // webpack: (config: any) => {
        //   const existingWebpack = incomingConfig.admin?.webpack || ((config: any) => config)

        //   return {
        //     ...existingWebpack(config),
        //     resolve: {
        //       ...config.resolve,
        //       alias: {
        //         ...config.resolve?.alias,
        //         '@supabase/supabase-js': require.resolve('@supabase/supabase-js'),
        //       },
        //     },
        //   }
        // },
      },
    }

    return config
  }
