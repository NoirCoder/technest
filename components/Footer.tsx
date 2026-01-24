import Link from 'next/link';

const categories = [
    { name: 'Keyboards', slug: 'keyboards' },
    { name: 'Mice', slug: 'mice' },
    { name: 'Headphones', slug: 'headphones' },
    { name: 'Monitors', slug: 'monitors' },
    { name: 'Desk Accessories', slug: 'desk-accessories' },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-neutral-900 text-neutral-300 mt-20">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold font-serif text-white mb-3">
                            Tech<span className="text-primary-400">Nest</span>
                        </h3>
                        <p className="text-neutral-400 mb-4 max-w-md">
                            Smart tech picks for modern work. We review productivity gear and desk tech to help you make better buying decisions.
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2">
                            {categories.map((category) => (
                                <li key={category.slug}>
                                    <Link
                                        href={`/category/${category.slug}`}
                                        className="text-neutral-400 hover:text-white transition-colors duration-200"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">More</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors duration-200">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors duration-200">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-neutral-800 mt-8 pt-8 text-sm text-neutral-500">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© {currentYear} TechNest. All rights reserved.</p>
                        <p className="text-xs">
                            As an Amazon Associate, we earn from qualifying purchases.
                            <Link href="/disclosure" className="ml-1 underline hover:text-neutral-300">
                                Full Disclosure
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
