# Deploying this app to Vercel

This project is a TanStack Start app built with Nitro. By default the Lovable
build targets **Cloudflare Workers**, which is why a Vercel deploy builds
successfully but serves a blank page.

To deploy on Vercel:

1. Vercel project → Settings → Environment Variables, add:
   - `NITRO_PRESET` = `vercel`
   - `VITE_SUPABASE_URL` = (same value as in `.env`)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = (same value as in `.env`)
   - `VITE_SUPABASE_PROJECT_ID` = (same value as in `.env`)
2. Build command: `npm run build` — Output directory: leave empty
   (Nitro's Vercel preset writes `.vercel/output` automatically).
3. Redeploy.

Without `NITRO_PRESET=vercel` the server bundle is a Cloudflare Worker and
Vercel has nothing to serve, so the page stays empty.

The database/auth backend is unchanged and works from any host, as long as the
three `VITE_SUPABASE_*` variables above are set in Vercel.
