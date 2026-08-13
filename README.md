# HH Goa 2026 Frame Generator

A production-ready React + Vite application that generates branded profile frames and ID cards for Hacker House Goa 2026.

## Features
- **Format A**: PFP Frame (1080x1080) with automatic circular cover-cropping
- **Format B**: Builder ID Card (1200x1500) with Name, Role, and custom text rendering
- **Zero Login**: Users can upload, generate, and download immediately
- **Client-Side Rendering**: Fast image composition using the HTML5 Canvas API
- **EXIF Support**: Automatically corrects rotated mobile photos
- **Social Sharing**: Uploads to Supabase Storage and generates public Share URLs with Open Graph previews for X (Twitter) integration
- **Responsive**: Fully optimized for mobile screens (320px+)

## Quick Start (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Supabase credentials if you want to test the Share to X functionality.
   ```bash
   cp .env.example .env
   ```
   *(Note: Image generation and downloading work perfectly without any backend credentials. The backend is only required for the "Share to X" functionality.)*

3. **Run locally:**
   ```bash
   npm run dev
   ```

## Production Deployment

This project is built for **Vercel** with serverless functions for the sharing API.

### 1. Supabase Setup
- Create a new project in [Supabase](https://supabase.com)
- Create a new public storage bucket named `hh-goa-generated`
- Get your Project URL and Service Role Key from the API settings

### 2. Vercel Setup
- Push this code to a GitHub repository
- Import the project into Vercel
- Set the following Environment Variables in the Vercel dashboard:
  - `VITE_APP_BASE_URL` (e.g. `https://your-app.vercel.app`)
  - `STORAGE_PROVIDER=supabase`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_BUCKET=hh-goa-generated`

Vercel will automatically detect the `api/` folder and deploy them as Serverless Functions, and the `vercel.json` will correctly route `/share/:id` URLs to generate Open Graph tags.

## Architecture & Code Quality

- **Modular**: UI components (`src/components/`), canvas renderers (`src/formats/`), logic hooks (`src/hooks/`) and pure functions (`src/lib/`) are cleanly separated.
- **Canvas Generation**: Doesn't use DOM-to-image tricks. Uses native `CanvasRenderingContext2D` to build high-quality images ready for export.
- **Type Safety**: Strictly typed with TypeScript.
- **Error Handling**: Graceful fallbacks for unsupported HEIC files, file size limits, and failed network uploads.

## QA Matrix Passed
- [x] Tested with JPG, PNG, and HEIC inputs
- [x] Tested Portrait, Landscape, and Square aspect ratios
- [x] Verified EXIF rotation on mobile uploads
- [x] Tested #FrameInGoa X Intent caption
- [x] Tested 320px mobile layout handling (no horizontal scroll)
- [x] Verified Open Graph image meta tags
