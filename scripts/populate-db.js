const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually since we can't rely on dotenv being installed
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, ''); // Remove quotes if present
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY; // Need service role to bypass RLS if needed, or just insert

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Could not find Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SAMPLE_POSTS = [
    {
        title: 'Keychron Q1 Pro Review: The Best Mechanical Keyboard for Mac Users',
        slug: 'keychron-q1-pro-review',
        excerpt: 'The Keychron Q1 Pro brings wireless connectivity and a premium aluminum body to the mass market. Is it the ultimate custom keyboard for productivity? We break it down.',
        content: `# Keychron Q1 Pro Review

The mechanical keyboard hobby has exploded in recent years, but finding a board that works perfectly with macOS _and_ feels premium straight out of the box has always been a challenge. Enter the **Keychron Q1 Pro**.

## Design & Build

The first thing you notice is the weight. The Q1 Pro features a full CNC-machined aluminum body that feels like a tank (in a good way). It stays planted on your desk and offers a typing sound that plastic boards just can't match.

### Key Features

- **Wireless**: Bluetooth 5.1 allows you to connect up to 3 devices.
- **QMK/VIA Support**: Remap any key instantly using a web browser.
- **Gasket Mount**: A softer typing feel that reduces finger fatigue.

## Typing Experience

We tested the version with Keychron's specific "Banana" switches—a tactile switch that offers a satisfying bump at the very top of the press. For writers and coders, this is pure bliss. The pre-lubed stabilizers mean there's absolutely no "rattle" on the spacebar or shift keys.

## Verdict

For $199, the Keychron Q1 Pro offers value that used to cost $400+ in the custom keyboard world. It's wireless, built like a brick, and fully customizable.

**Highly Recommended.**`,
        featured_image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1200&auto=format&fit=crop',
        meta_title: 'Keychron Q1 Pro Review: 75% Wireless Mechanical Keyboard',
        meta_description: 'Full review of the Keychron Q1 Pro. Wireless, aluminum, and fully customizable. Is this the best keyboard for Mac users in 2026?',
        published: true,
        featured: true,
        published_at: new Date().toISOString(),
        category_slug: 'keyboards'
    },
    {
        title: 'Logitech MX Master 3S: Still the King of Productivity Mice?',
        slug: 'logitech-mx-master-3s-review',
        excerpt: 'With its silent clicks and legendary scroll wheel, the MX Master 3S is a staple in offices worldwide. We tested it for 3 months to see if it holds up.',
        content: `# Logitech MX Master 3S Review

If you walk into any design agency or engineering startup, you'll see this mouse everywhere. The **Logitech MX Master 3S** isn't just a mouse; it's a command center for your hand.

## The Scroll Wheel

The "MagSpeed" electromagnetic scroll wheel is the star here. It can scroll 1,000 lines per second in silence, or toggle to a precise ratchet mode for line-by-line coding. Once you use it, you can't go back to a regular wheel.

## Conclusion

It's reliable, comfortable, and functional. If you work 8 hours a day at a computer, your wrist deserves this upgrade.`,
        featured_image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200&auto=format&fit=crop',
        meta_title: 'Logitech MX Master 3S Review (2026)',
        meta_description: 'Is the Logitech MX Master 3S still worth buying? We revisit the king of productivity mice.',
        published: true,
        featured: true,
        published_at: new Date().toISOString(),
        category_slug: 'mice'
    }
];

async function seed() {
    console.log('🌱 Seeding database with demo content...');

    // 1. Get Categories
    const { data: categories, error: catError } = await supabase.from('categories').select('id, slug');
    if (catError) {
        console.error('Error fetching categories:', catError);
        return;
    }

    const categoryMap = {};
    categories.forEach(c => categoryMap[c.slug] = c.id);

    // 2. Insert Posts
    for (const post of SAMPLE_POSTS) {
        const { category_slug, ...postData } = post;
        const categoryId = categoryMap[category_slug];

        if (!categoryId) {
            console.warn(`Category ${category_slug} not found, skipping post ${post.title}`);
            continue;
        }

        // Insert Post
        const { data: newPost, error: postError } = await supabase
            .from('posts')
            .upsert(postData, { onConflict: 'slug' })
            .select()
            .single();

        if (postError) {
            console.error(`Error inserting post ${post.title}:`, postError);
            continue;
        }

        // Link Category
        const { error: linkError } = await supabase
            .from('post_categories')
            .upsert({ post_id: newPost.id, category_id: categoryId });

        if (linkError) {
            console.error(`Error linking category for ${post.title}:`, linkError);
        } else {
            console.log(`✅ Created post: ${post.title}`);
        }
    }

    console.log('✨ Database seeding complete!');
}

seed();
