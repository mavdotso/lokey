import { InferSelectModel } from 'drizzle-orm';
import { customers, prices, products, spaces, subscriptions, users } from './schema';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    public: {
        Tables: {
            activity_notifications: {
                Row: {
                    created_at: string;
                    id: string;
                    message: string;
                    read_at: string | null;
                    space_id: string | null;
                    user_id: string | null;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    message: string;
                    read_at?: string | null;
                    space_id?: string | null;
                    user_id?: string | null;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    message?: string;
                    read_at?: string | null;
                    space_id?: string | null;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'activity_notifications_space_id_spaces_id_fk';
                        columns: ['space_id'];
                        isOneToOne: false;
                        referencedRelation: 'spaces';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'activity_notifications_user_id_users_id_fk';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            credential_access_logs: {
                Row: {
                    accessed_at: string;
                    credential_id: string | null;
                    id: string;
                    user_id: string | null;
                };
                Insert: {
                    accessed_at?: string;
                    credential_id?: string | null;
                    id?: string;
                    user_id?: string | null;
                };
                Update: {
                    accessed_at?: string;
                    credential_id?: string | null;
                    id?: string;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'credential_access_logs_credential_id_credentials_id_fk';
                        columns: ['credential_id'];
                        isOneToOne: false;
                        referencedRelation: 'credentials';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'credential_access_logs_user_id_users_id_fk';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            credentials: {
                Row: {
                    created_at: string;
                    custom_type_id: string | null;
                    description: string | null;
                    encrypted_data: Json;
                    expires_at: string | null;
                    id: string;
                    max_views: number | null;
                    name: string;
                    space_id: string | null;
                    subtype: string | null;
                    type: Database['public']['Enums']['credential_type'];
                    updated_at: string;
                    view_count: number;
                };
                Insert: {
                    created_at?: string;
                    custom_type_id?: string | null;
                    description?: string | null;
                    encrypted_data: Json;
                    expires_at?: string | null;
                    id?: string;
                    max_views?: number | null;
                    name: string;
                    space_id?: string | null;
                    subtype?: string | null;
                    type: Database['public']['Enums']['credential_type'];
                    updated_at?: string;
                    view_count?: number;
                };
                Update: {
                    created_at?: string;
                    custom_type_id?: string | null;
                    description?: string | null;
                    encrypted_data?: Json;
                    expires_at?: string | null;
                    id?: string;
                    max_views?: number | null;
                    name?: string;
                    space_id?: string | null;
                    subtype?: string | null;
                    type?: Database['public']['Enums']['credential_type'];
                    updated_at?: string;
                    view_count?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'credentials_custom_type_id_custom_credential_types_id_fk';
                        columns: ['custom_type_id'];
                        isOneToOne: false;
                        referencedRelation: 'custom_credential_types';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'credentials_space_id_spaces_id_fk';
                        columns: ['space_id'];
                        isOneToOne: false;
                        referencedRelation: 'spaces';
                        referencedColumns: ['id'];
                    }
                ];
            };
            custom_credential_types: {
                Row: {
                    created_at: string;
                    description: string | null;
                    id: string;
                    name: string;
                    schema: Json;
                    space_id: string | null;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name: string;
                    schema: Json;
                    space_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name?: string;
                    schema?: Json;
                    space_id?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'custom_credential_types_space_id_spaces_id_fk';
                        columns: ['space_id'];
                        isOneToOne: false;
                        referencedRelation: 'spaces';
                        referencedColumns: ['id'];
                    }
                ];
            };
            customers: {
                Row: {
                    id: string;
                    stripe_customer_id: string | null;
                };
                Insert: {
                    id: string;
                    stripe_customer_id?: string | null;
                };
                Update: {
                    id?: string;
                    stripe_customer_id?: string | null;
                };
                Relationships: [];
            };
            prices: {
                Row: {
                    active: boolean | null;
                    currency: string | null;
                    description: string | null;
                    id: string;
                    interval: Database['public']['Enums']['pricing_plan_interval'] | null;
                    interval_count: number | null;
                    metadata: Json | null;
                    product_id: string | null;
                    trial_period_days: number | null;
                    type: Database['public']['Enums']['pricing_type'] | null;
                    unit_amount: number | null;
                };
                Insert: {
                    active?: boolean | null;
                    currency?: string | null;
                    description?: string | null;
                    id: string;
                    interval?: Database['public']['Enums']['pricing_plan_interval'] | null;
                    interval_count?: number | null;
                    metadata?: Json | null;
                    product_id?: string | null;
                    trial_period_days?: number | null;
                    type?: Database['public']['Enums']['pricing_type'] | null;
                    unit_amount?: number | null;
                };
                Update: {
                    active?: boolean | null;
                    currency?: string | null;
                    description?: string | null;
                    id?: string;
                    interval?: Database['public']['Enums']['pricing_plan_interval'] | null;
                    interval_count?: number | null;
                    metadata?: Json | null;
                    product_id?: string | null;
                    trial_period_days?: number | null;
                    type?: Database['public']['Enums']['pricing_type'] | null;
                    unit_amount?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'prices_product_id_products_id_fk';
                        columns: ['product_id'];
                        isOneToOne: false;
                        referencedRelation: 'products';
                        referencedColumns: ['id'];
                    }
                ];
            };
            products: {
                Row: {
                    active: boolean | null;
                    description: string | null;
                    id: string;
                    image: string | null;
                    metadata: Json | null;
                    name: string | null;
                };
                Insert: {
                    active?: boolean | null;
                    description?: string | null;
                    id: string;
                    image?: string | null;
                    metadata?: Json | null;
                    name?: string | null;
                };
                Update: {
                    active?: boolean | null;
                    description?: string | null;
                    id?: string;
                    image?: string | null;
                    metadata?: Json | null;
                    name?: string | null;
                };
                Relationships: [];
            };
            spaces: {
                Row: {
                    created_at: string;
                    id: string;
                    name: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    name: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    name?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            subscriptions: {
                Row: {
                    cancel_at: string | null;
                    cancel_at_period_end: boolean | null;
                    canceled_at: string | null;
                    created: string;
                    current_period_end: string;
                    current_period_start: string;
                    ended_at: string | null;
                    id: string;
                    metadata: Json | null;
                    price_id: string | null;
                    quantity: number | null;
                    status: Database['public']['Enums']['subscription_status'] | null;
                    trial_end: string | null;
                    trial_start: string | null;
                    user_id: string;
                };
                Insert: {
                    cancel_at?: string | null;
                    cancel_at_period_end?: boolean | null;
                    canceled_at?: string | null;
                    created?: string;
                    current_period_end?: string;
                    current_period_start?: string;
                    ended_at?: string | null;
                    id: string;
                    metadata?: Json | null;
                    price_id?: string | null;
                    quantity?: number | null;
                    status?: Database['public']['Enums']['subscription_status'] | null;
                    trial_end?: string | null;
                    trial_start?: string | null;
                    user_id: string;
                };
                Update: {
                    cancel_at?: string | null;
                    cancel_at_period_end?: boolean | null;
                    canceled_at?: string | null;
                    created?: string;
                    current_period_end?: string;
                    current_period_start?: string;
                    ended_at?: string | null;
                    id?: string;
                    metadata?: Json | null;
                    price_id?: string | null;
                    quantity?: number | null;
                    status?: Database['public']['Enums']['subscription_status'] | null;
                    trial_end?: string | null;
                    trial_start?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'subscriptions_price_id_prices_id_fk';
                        columns: ['price_id'];
                        isOneToOne: false;
                        referencedRelation: 'prices';
                        referencedColumns: ['id'];
                    }
                ];
            };
            user_spaces: {
                Row: {
                    role: Database['public']['Enums']['user_role'];
                    space_id: string | null;
                    user_id: string | null;
                };
                Insert: {
                    role?: Database['public']['Enums']['user_role'];
                    space_id?: string | null;
                    user_id?: string | null;
                };
                Update: {
                    role?: Database['public']['Enums']['user_role'];
                    space_id?: string | null;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'user_spaces_space_id_spaces_id_fk';
                        columns: ['space_id'];
                        isOneToOne: false;
                        referencedRelation: 'spaces';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'user_spaces_user_id_users_id_fk';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            users: {
                Row: {
                    avatar_url: string | null;
                    billing_address: Json | null;
                    email: string | null;
                    full_name: string | null;
                    id: string;
                    payment_method: Json | null;
                    role: Database['public']['Enums']['user_role'];
                    updated_at: string | null;
                };
                Insert: {
                    avatar_url?: string | null;
                    billing_address?: Json | null;
                    email?: string | null;
                    full_name?: string | null;
                    id: string;
                    payment_method?: Json | null;
                    role?: Database['public']['Enums']['user_role'];
                    updated_at?: string | null;
                };
                Update: {
                    avatar_url?: string | null;
                    billing_address?: Json | null;
                    email?: string | null;
                    full_name?: string | null;
                    id?: string;
                    payment_method?: Json | null;
                    role?: Database['public']['Enums']['user_role'];
                    updated_at?: string | null;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            aal_level: 'aal3' | 'aal2' | 'aal1';
            action: 'ERROR' | 'TRUNCATE' | 'DELETE' | 'UPDATE' | 'INSERT';
            code_challenge_method: 'plain' | 's256';
            credential_type:
                | 'login_password'
                | 'api_key'
                | 'oauth_token'
                | 'ssh_key'
                | 'ssl_certificate'
                | 'env_variable'
                | 'database_credential'
                | 'access_key'
                | 'encryption_key'
                | 'jwt_token'
                | 'two_factor_secret'
                | 'webhook_secret'
                | 'smtp_credential'
                | 'ftp_credential'
                | 'vpn_credential'
                | 'dns_credential'
                | 'device_key'
                | 'key_value'
                | 'custom'
                | 'other'
                | 'password';
            equality_op: 'in' | 'gte' | 'gt' | 'lte' | 'lt' | 'neq' | 'eq';
            factor_status: 'verified' | 'unverified';
            factor_type: 'webauthn' | 'totp';
            key_status: 'expired' | 'invalid' | 'valid' | 'default';
            key_type: 'stream_xchacha20' | 'secretstream' | 'secretbox' | 'kdf' | 'generichash' | 'shorthash' | 'auth' | 'hmacsha256' | 'hmacsha512' | 'aead-det' | 'aead-ietf';
            pricing_plan_interval: 'year' | 'month' | 'week' | 'day';
            pricing_type: 'recurring' | 'one_time';
            subscription_status: 'unpaid' | 'past_due' | 'incomplete_expired' | 'incomplete' | 'canceled' | 'active' | 'trialing';
            user_role: 'admin' | 'manager' | 'member';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
    PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] & Database[PublicTableNameOrOptions['schema']]['Views'])
        : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions['schema']]['Tables'] & Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
          Row: infer R;
      }
        ? R
        : never
    : never;

export type TablesInsert<
    PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions['schema']]['Tables'] : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
          Insert: infer I;
      }
        ? I
        : never
    : never;

export type TablesUpdate<
    PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions['schema']]['Tables'] : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
          Update: infer U;
      }
        ? U
        : never
    : never;

export type Enums<
    PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums'] : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type workspace = InferSelectModel<typeof spaces>;
export type User = InferSelectModel<typeof users>;
export type Product = InferSelectModel<typeof products>;
export type Price = InferSelectModel<typeof prices> & { products?: Product };
export type Customer = InferSelectModel<typeof customers>;
export type Subscription = InferSelectModel<typeof subscriptions> & {
    prices: Price;
};

export type ProductWirhPrice = Product & {
    prices?: Price[];
};
