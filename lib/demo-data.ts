import { Category, Post, PostWithCategories } from './supabase';

export const DEMO_CATEGORIES: Category[] = [
    {
        id: 'cat-1',
        name: 'Keyboards',
        slug: 'keyboards',
        description: 'Mechanical, wireless, and ergonomic keyboards for coding and typing.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'cat-2',
        name: 'Mice',
        slug: 'mice',
        description: 'Precision mice and trackballs for productivity and comfort.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'cat-3',
        name: 'Headphones',
        slug: 'headphones',
        description: 'Noise-cancelling headphones and earbuds for deep work.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'cat-4',
        name: 'Monitors',
        slug: 'monitors',
        description: '4K, ultrawide, and ergonomic displays for your battlestation.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'cat-5',
        name: 'Desk Accessories',
        slug: 'desk-accessories',
        description: 'Hubs, stands, lighting, and organizers.',
        created_at: new Date().toISOString(),
    },
];

export const DEMO_POSTS: PostWithCategories[] = [
    {
        id: 'post-1',
        title: 'Keychron Q1 Pro Review: The Best Mechanical Keyboard for Mac Users',
        slug: 'keychron-q1-pro-review',
        excerpt: 'The Keychron Q1 Pro brings wireless connectivity and a premium aluminum body to the mass market. Is it the ultimate custom keyboard for productivity? We break it down.',
        content: `
# Keychron Q1 Pro Review

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

**Highly Recommended.**
    `,
        featured_image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1200&auto=format&fit=crop',
        meta_title: 'Keychron Q1 Pro Review: 75% Wireless Mechanical Keyboard',
        meta_description: 'Full review of the Keychron Q1 Pro. Wireless, aluminum, and fully customizable. Is this the best keyboard for Mac users in 2026?',
        author_id: 'top-rated',
        published: true,
        featured: true,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: [DEMO_CATEGORIES[0]], // Keyboards
        review: {
            rating: 9.2,
            productName: 'Keychron Q1 Pro',
            pros: ['Incredible CNC aluminum build quality', 'Wireless Bluetooth 5.1 stability', 'Fully programmable via QMK/VIA', 'Great "thocky" sound out of the box'],
            cons: ['Stock keycaps are just okay', 'Battery life is average with RGB on'],
            verdict: 'The Keychron Q1 Pro is simply the best value in mechanical keyboards right now. It bridges the gap between enthusiast custom boards and consumer convenience perfectly.'
        }
    },
    {
        id: 'post-2',
        title: 'Logitech MX Master 3S: Still the King of Productivity Mice?',
        slug: 'logitech-mx-master-3s-review',
        excerpt: 'With its silent clicks and legendary scroll wheel, the MX Master 3S is a staple in offices worldwide. We tested it for 3 months to see if it holds up.',
        content: `
# Logitech MX Master 3S Review

If you walk into any design agency or engineering startup, you'll see this mouse everywhere. The **Logitech MX Master 3S** isn't just a mouse; it's a command center for your hand.

## The Scroll Wheel

The "MagSpeed" electromagnetic scroll wheel is the star here. It can scroll 1,000 lines per second in silence, or toggle to a precise ratchet mode for line-by-line coding. Once you use it, you can't go back to a regular wheel.

## Ergonomics

The shape is sculpted perfectly for right-handed users. Your thumb rests naturally on the gesture button, which allows you to switch desktops or open Mission Control with a simple swipe.

### Pros
- 90% quieter clicks than the previous model
- 70-day battery life
- Connects to 3 devices smoothly

### Cons
- Still uses Logi Options+ software (can be buggy)
- Not for lefties

## Conclusion

It's reliable, comfortable, and functional. If you work 8 hours a day at a computer, your wrist deserves this upgrade.
    `,
        featured_image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200&auto=format&fit=crop',
        meta_title: 'Logitech MX Master 3S Review (2026)',
        meta_description: 'Is the Logitech MX Master 3S still worth buying? We revisit the king of productivity mice.',
        author_id: 'top-rated',
        published: true,
        featured: true,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: [DEMO_CATEGORIES[1]], // Mice
        review: {
            rating: 9.5,
            productName: 'Logitech MX Master 3S',
            pros: ['Near-silent click mechanism', 'MagSpeed scroll wheel is unmatched', 'Excellent battery life (70 days)', 'Comfortable ergonomic shape'],
            cons: ['Polling rate is low for gaming', 'Logi Options+ software can be bloated'],
            verdict: 'If you work 8 hours a day at a computer, this is non-negotiable equipment. The silent clicks alone make it a worthy upgrade over the 2S or 3.'
        }
    },
    {
        id: 'post-3',
        title: 'Top 5 Ultrawide Monitors for Coding and Multitasking',
        slug: 'best-ultrawide-monitors-coding',
        excerpt: 'Ditch the dual-monitor setup. An ultrawide gives you a seamless canvas for code, previewers, and Slack. Here are our top picks for 2026.',
        content: `
# Best Ultrawide Monitors

Why use two bezels when you can have one seamless horizon? Ultrawide monitors are a productivity cheat code.

## 1. LG 40WP95C (The Resolution King)
A 40-inch 5K2K display that essentially gives you two 27-inch 4K monitors in one. The text clarity is unmatched.

## 2. Dell U4025QW
Dell's IPS Black technology offers deeper blacks and better contrast than standard IPS panels, making dark mode coding sessions easier on the eyes.

## 3. Samsung Odyssey Neo G9
Overkill? Maybe. But for immersion, nothing beats this 49-inch super-ultrawide. It's like having two 27-inch 1440p monitors side-by-side without a gap.

## Summary

Focus on **pixel density (PPI)** if you're reading text all day. The 5K2K resolution (5120 x 2160) is the sweet spot for productivity.
    `,
        featured_image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop',
        meta_title: 'Best Ultrawide Monitors for Programmers (2026)',
        meta_description: 'Our curated list of the best ultrawide monitors for coding, multitasking, and productivity.',
        author_id: 'top-rated',
        published: true,
        featured: true,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: [DEMO_CATEGORIES[3]], // Monitors
    },
    {
        id: 'post-4',
        title: 'Minimalist Desk Setup Guide: Doing More With Less',
        slug: 'minimalist-desk-setup-guide',
        excerpt: 'A cluttered desk is a cluttered mind. We explore the essentials of building a distraction-free workspace that looks good and works better.',
        content: `
# The Minimalist Desk Setup

Minimalism isn't about having nothing; it's about having only what adds value.

## The Essentials

1.  **Monitor Light Bar**: Saves desk space and reduces eye strain. BenQ ScreenBar is the gold standard.
2.  **Desk Mat**: Defines your space and improves acoustics. Felt or leather works best.
3.  **Cable Management**: If you can see cables, you're doing it wrong. A simple cable tray and velcro ties can transform a setup.

## Philosophy

Every item on your desk should have a purpose. If you use it once a month, put it in a drawer. Your desk surface is prime real estate—treat it that way.
    `,
        featured_image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop',
        meta_title: 'Minimalist Desk Setup Guide 2026',
        meta_description: 'How to build a clean, distraction-free workspace.',
        author_id: 'top-rated',
        published: true,
        featured: false,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: [DEMO_CATEGORIES[4]], // Desk Accessories
    },
    {
        id: 'post-5',
        title: 'Sony WH-1000XM5 vs AirPods Max: The Silent Battle',
        slug: 'sony-xm5-vs-airpods-max',
        excerpt: 'The two titans of active noise cancellation go head-to-head. Which one deserves a spot in your daily carry bag?',
        content: `
# Battle of the Cans

Noise-cancelling headphones are essential office survival gear.

## Sony WH-1000XM5
- **Pros**: Lighter, better ANC, multi-point connection works flawlessly.
- **Cons**: Design feels a bit plasticky compared to Apple.

## AirPods Max
- **Pros**: Incredible build quality, transparency mode is unmatched.
- **Cons**: Heavy, expensive, "Smart Case" is useless.

## The Verdict
For pure commuting and travel, the **Sony XM5** wins on comfort and ANC performance. For Apple ecosystem purists working from a quiet home office, the AirPods Max offer better integration.
    `,
        featured_image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=1200&auto=format&fit=crop',
        meta_title: 'Sony XM5 vs AirPods Max: 2026 Comparison',
        meta_description: 'Comparison of the best noise cancelling headphones for productivity.',
        author_id: 'top-rated',
        published: true,
        featured: false,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: [DEMO_CATEGORIES[2]], // Headphones
    },
    {
        id: 'post-6',
        title: 'Standing Desks: Are They Worth The Hype?',
        slug: 'standing-desk-guide',
        excerpt: 'We reviewed the top standing desks from Uplift, Jarvis, and Secretlab to see if standing really improves your health and focus.',
        content: `
# The Standing Revolution

Sitting is the new smoking, they say. But is a $800 desk the cure?

## Usage Reality
Most people buy a standing desk and... never stand. The key is **presets**. If you have to hold a button for 30 seconds to change height, you won't do it. One-touch memory keys are mandatory.

## Stability
The biggest differentiator is wobble at standing height. A 4-leg desk (like the Uplift V2 Commercial) is rock solid, while 2-leg desks can shake your monitor while typing.

## Verdict
Yes, it's worth it *if* you commit to the lifestyle.
    `,
        featured_image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=1200&auto=format&fit=crop',
        meta_title: 'Best Standing Desks 2026 Review',
        meta_description: 'Standing desk comparison and buying guide.',
        author_id: 'top-rated',
        published: true,
        featured: false,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: [DEMO_CATEGORIES[4]], // Desk Accessories
    },
];
