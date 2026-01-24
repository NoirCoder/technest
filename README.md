# 🚀 TechNest - Authority Tech Blog

**Welcome to your new affiliate empire.**
TechNest is a high-performance, professionally designed tech blog built to rank on Google and convert visitors into buyers.

---

## ⚡ Deployment (Make it Live)

You are currently running the site locally. To put it on the internet for free with a custom domain (e.g., `technest.com`):

### 1. Push Code to GitHub
(You likely already did this to get the code here).
1. Go to [GitHub.com](https://github.com) and create a new repository called `technest`.
2. Run these commands in your VS Code terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial launch"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/technest.git
   git push -u origin main
   ```

### 2. Live Hosting on Vercel (Free)
1. Go to [Vercel.com](https://vercel.com) and sign up (Free Hobby Tier).
2. Click **"Add New Project"** -> **Import** from GitHub.
3. Select your `technest` repository.
4. **Important**: In the "Environment Variables" section, copy the keys from your local `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**.

🎉 **Your site is now live!** Vercel will give you a URL like `technest.vercel.app`.

### 3. Add Custom Domain
1. In Vercel Project Settings > **Domains**.
2. Type your domain (e.g., `mytechnest.com`).
3. Follow the DNS instructions (usually adding an A record or CNAME to your domain registrar like GoDaddy or Namecheap).

---

## 📝 How to Manage Content

### Option A: The Admin Dashboard (Easiest)
1. Go to `https://your-site.com/admin/login`
   *(First, create a user in your Supabase Dashboard > Authentication > Users)*.
2. Click **"New Post"**.
3. Write your content.
4. Paste your **Amazon Affiliate Links** directly into the text.
5. Click **Publish**.

### Option B: Supabase Dashboard (Direct Database)
1. Go to [Supabase Table Editor](https://supabase.com/dashboard).
2. Open the `posts` table.
3. Click **"Insert Row"**.
4. Fill in the fields:
   - `title`: "My New Keyboard Review"
   - `slug`: "my-new-keyboard-review" (must be unique URL friendly)
   - `content`: Markdown text (use ChatGPT to generate drafts!)
   - `published`: TRUE

---

## 🎨 Features & "Pro" Tricks

### 1. Search Overlay
Press `CMD + K` (on Mac) or `CTRL + K` (on Windows), or click the Search icon in the header. It instantly searches all your reviews.

### 2. "The Verdict" Score Card
To add the colorful "Verdict" box at the bottom of a review, you currently need to add it via the Database (Supabase) in the `review` column (it's a JSON field).
**JSON Format:**
```json
{
  "rating": 9.5,
  "productName": "Product Name",
  "verdict": "This is the best product ever.",
  "pros": ["Silent clicks", "Great battery"],
  "cons": ["Expensive"]
}
```

### 3. SEO is Automatic
You don't need to install plugins.
- **Sitemap**: Generated automatically at `/sitemap.xml`.
- **Meta Tags**: Generated from your post title and excerpt.
- **Schema**: Google "Review" schema is built-in.

---

## 💰 Making Money (Affiliate Guide)

1. **Amazon Associates**: Sign up. Get your tag (e.g., `technest-20`).
2. **Setup**: When you write a review, just use standard links: `[Buy on Amazon](https://amazon.com/dp/B08...?tag=technest-20)`.
3. **Disclosures**: The site automatically puts "As an Amazon Associate..." in the footer.

---

## 🛠 Maintenance

- **Update Content**: Just edit the rows in Supabase. The site updates within 1 hour automatically (ISR).
- **Free Tiers**:
  - Vercel: Free forever for personal use.
  - Supabase: Free up to 500MB database (enough for 10,000+ posts).

**Need Help?**
Check the `CONTENT_GUIDE.md` for writing tips.

Built with ❤️ by TechNest.
