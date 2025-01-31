import type { Plugin } from 'payload';
export interface SupabaseConfig {
    supabaseUrl: string;
    supabaseKey: string;
    /**
     * Enable Supabase Auth integration
     * @default false
     */
    auth?: boolean;
    /**
     * Enable Supabase Realtime integration
     * @default false
     */
    realtime?: boolean;
    /**
     * Disable the plugin
     * @default false
     */
    disabled?: boolean;
    /**
     * Collections to sync with Supabase
     */
    collections?: {
        [key: string]: {
            /**
             * Enable syncing this collection to Supabase
             */
            sync?: boolean;
            /**
             * Supabase table name (defaults to collection slug)
             */
            tableName?: string;
        };
    };
}
export declare const supabasePlugin: (pluginOptions: SupabaseConfig) => Plugin;
