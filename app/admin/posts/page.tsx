'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/markdown';

export default function PostsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        const filtered = posts.filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredPosts(filtered);
    }, [searchQuery, posts]);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('updated_at', { ascending: false });

        if (data) {
            setPosts(data);
            setFilteredPosts(data);
        }
        setLoading(false);
    };

    const togglePublished = async (postId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('posts')
            .update({
                published: !currentStatus,
                published_at: !currentStatus ? new Date().toISOString() : null
            })
            .eq('id', postId);

        if (!error) {
            fetchPosts();
        }
    };

    const deletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (!error) {
            fetchPosts();
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-neutral-900">Posts</h1>
                    <p className="text-neutral-600 mt-1">Manage your blog posts</p>
                </div>
                <Link href="/admin/posts/new" className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                </Link>
            </div>

            {/* Search */}
            <div className="card p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Posts Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Updated
                                </th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-semibold text-neutral-900">{post.title}</div>
                                            {post.excerpt && (
                                                <div className="text-sm text-neutral-600 line-clamp-1">{post.excerpt}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${post.published
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}
                                        >
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        {formatDate(post.updated_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => togglePublished(post.id, post.published)}
                                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title={post.published ? 'Unpublish' : 'Publish'}
                                            >
                                                {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <Link
                                                href={`/admin/posts/edit/${post.id}`}
                                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => deletePost(post.id)}
                                                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-neutral-500">No posts found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
