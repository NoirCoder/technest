import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Types
export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featured_image: string | null;
    meta_title: string | null;
    meta_description: string | null;
    author_id: string | null;
    published: boolean;
    featured: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    review?: {
        rating: number;
        pros: string[];
        cons: string[];
        verdict: string;
        productName: string;
    };
}

export interface PostWithCategories extends Post {
    categories: Category[];
}
