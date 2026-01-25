'use server';

import { revalidatePath } from 'next/cache';

/**
 * Purges the Vercel Edge Cache for specific paths on-demand.
 * This ensures the public site reflects database changes immediately.
 */
export async function revalidateBlog(slug?: string) {
    try {
        // Revalidate the blog index
        revalidatePath('/blog');
        revalidatePath('/');

        // Revalidate the specific post if slug is provided
        if (slug) {
            revalidatePath(`/blog/${slug}`);
        }

        console.log(`[Cache Sync] Revalidation triggered for ${slug || 'All'}`);
        return { success: true };
    } catch (error) {
        console.error('[Cache Sync] Revalidation failed:', error);
        return { success: false, error };
    }
}
