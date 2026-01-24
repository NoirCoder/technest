-- TechNest Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on slug for fast lookups
CREATE INDEX idx_categories_slug ON categories(slug);

-- Posts table
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    meta_title TEXT,
    meta_description TEXT,
    author_id UUID REFERENCES auth.users(id),
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_featured ON posts(featured) WHERE featured = TRUE;

-- Post categories junction table (many-to-many)
CREATE TABLE post_categories (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- Create indexes for junction table
CREATE INDEX idx_post_categories_post ON post_categories(post_id);
CREATE INDEX idx_post_categories_category ON post_categories(category_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert categories" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Posts policies (public can read published, admin can do everything)
CREATE POLICY "Public can view published posts" ON posts
    FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can view all posts" ON posts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert posts" ON posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update posts" ON posts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete posts" ON posts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Post categories policies
CREATE POLICY "Public can view post categories" ON post_categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage post categories" ON post_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
    ('Keyboards', 'keyboards', 'Mechanical keyboards, wireless keyboards, and typing accessories'),
    ('Mice', 'mice', 'Ergonomic mice, gaming mice, and productivity pointing devices'),
    ('Headphones', 'headphones', 'Wireless headphones, noise-cancelling headphones, and audio gear'),
    ('Monitors', 'monitors', 'Productivity monitors, ultrawide displays, and screen accessories'),
    ('Desk Accessories', 'desk-accessories', 'Cable management, monitor arms, desk mats, and workspace organization');
