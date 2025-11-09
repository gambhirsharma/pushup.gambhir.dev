# PushUp Tracker

A Next.js application with Supabase authentication for tracking push-up progress.

## Features

- 🔐 **Authentication**: Login/Signup with Supabase Auth
- 🏠 **Landing Page**: Public landing page for unauthenticated users
- 🔒 **Protected Routes**: Dashboard only accessible after login
- 🎨 **Modern UI**: Built with Tailwind CSS and dark mode support
- ⚡ **Next.js 16**: Using App Router and Server Components

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to **Settings** > **API**
3. Copy the following values:
   - `Project URL` (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon/public` key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 3. Configure Environment Variables

Update the `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Enable Email Authentication in Supabase

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Make sure **Email** is enabled
3. Configure email templates if needed (optional)

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx      # Login page
│   └── signup/page.tsx     # Signup page
├── dashboard/
│   ├── page.tsx            # Protected dashboard
│   └── logout-button.tsx   # Logout component
├── page.tsx                # Landing page (public)
├── layout.tsx              # Root layout
└── globals.css             # Global styles

lib/
└── supabase/
    ├── client.ts           # Browser Supabase client
    ├── server.ts           # Server Supabase client
    └── middleware.ts       # Auth middleware logic

middleware.ts               # Next.js middleware for route protection
```

## How It Works

### Authentication Flow

1. **Unauthenticated users** see the landing page at `/`
2. Users can navigate to `/login` or `/signup`
3. After successful authentication, users are redirected to `/dashboard`
4. The middleware automatically:
   - Redirects authenticated users from `/` to `/dashboard`
   - Redirects unauthenticated users from protected routes to `/login`
   - Prevents authenticated users from accessing login/signup pages

### Route Protection

The `middleware.ts` file handles all route protection:
- Protected routes require authentication
- Auth routes (login/signup) redirect authenticated users to dashboard
- Landing page redirects authenticated users to dashboard

## Technologies

- **Next.js 16** - React framework
- **Supabase** - Authentication and database
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Don't forget to add your environment variables in the Vercel dashboard!
