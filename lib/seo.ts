import { Metadata } from 'next';

export const siteConfig = {
    name: 'TechNest',
    description: 'Smart tech picks for modern work',
    url: 'https://technest.vercel.app',
    ogImage: 'https://technest.vercel.app/og-image.jpg',
};

export function generateMetadata({
    title,
    description,
    image,
    url,
}: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
}): Metadata {
    const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
    const metaDescription = description || siteConfig.description;
    const metaImage = image || siteConfig.ogImage;
    const metaUrl = url || siteConfig.url;

    return {
        title: metaTitle,
        description: metaDescription,
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            url: metaUrl,
            siteName: siteConfig.name,
            images: [
                {
                    url: metaImage,
                    width: 1200,
                    height: 630,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: metaTitle,
            description: metaDescription,
            images: [metaImage],
        },
    };
}

export function generateArticleSchema({
    title,
    description,
    image,
    datePublished,
    dateModified,
    authorName = 'TechNest Team',
    url,
}: {
    title: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified: string;
    authorName?: string;
    url: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        image: image,
        datePublished: datePublished,
        dateModified: dateModified,
        author: {
            '@type': 'Person',
            name: authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: siteConfig.name,
            logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
    };
}
