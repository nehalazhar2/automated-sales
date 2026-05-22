# Automated Sales — Next.js

Next.js 15 rebuild of automated-sales.com. App Router, TypeScript, MDX, Vercel.

## Stack

- **Next.js 15** App Router, static export per page (SSG) for instant TTFB.
- **TypeScript** strict mode.
- **MDX** for blog posts and case studies (`content/posts/`, `content/case-studies/`).
- **Resend** for the contact form (Server Action → Resend API).
- **Inter** via `next/font/google` (matches the original design).
- **No CSS framework** — the original `style.css` is ported verbatim into `app/globals.css`. Every `.as-*` class still works.

## Local setup

```bash
cd automated-sales-next
npm install
cp .env.example .env.local
# Fill in SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_TO from your cPanel mailbox
npm run dev
# open http://localhost:3000
```

## Project layout

```
app/
  layout.tsx                 Root layout, Inter font, default metadata, Header/Footer, ProfessionalService schema
  globals.css                Ported style.css
  page.tsx                   Home (/)
  <slug>/page.tsx            Each marketing page (pipedrive-consultant, ai-consultants, …)
  [slug]/page.tsx            MDX renderer — serves /:slug/ for blog posts + case studies
  blog/page.tsx              Blog index
  contact-2/page.tsx         Contact page (uses ContactForm)
  contact-2/actions.ts       Server Action: zod validation → Nodemailer
  sitemap.ts                 Sitemap (static routes + MDX)
  robots.ts                  Robots (preview environments are noindex)
  og/route.tsx               Dynamic OG image (1200×630)
  not-found.tsx              404
components/
  Header.tsx, Footer.tsx     Sticky glass header, four-column footer
  MobileNavToggle.tsx        Client component — mobile drawer toggle
  PageHero.tsx, CtaBox.tsx   Reusable section components
  ContactForm.tsx            Client component → submitContact server action
  MdxComponents.tsx          Map MDX tags → styled elements
  seo/
    StructuredData.tsx       JSON-LD script renderer
    schemas.ts               ProfessionalService, BlogPosting, BreadcrumbList builders
content/
  posts/                     Blog post MDX files
  case-studies/              Case study MDX files
lib/
  site.ts                    SITE_URL, SITE_NAME, NAV, FOOTER_LINKS
  seo.ts                     buildMetadata() helper used by every page
  mdx.ts                     MDX loader with frontmatter
  mailer.ts                  Resend SDK wrapper (Node runtime only)
public/
  images/                    Place WP images here (logo, hero, client logos)
  og/default.png             Static fallback OG image (replace with branded asset)
```

## SEO

The rebuild preserves URL parity with the live WordPress sitemap:

- `next.config.ts` sets `trailingSlash: true` — every URL ends with `/`.
- `app/sitemap.ts` enumerates all static + MDX routes.
- `app/robots.ts` allows search engines on production, blocks them on Vercel preview deploys.
- Every page exports `metadata` via `lib/seo.ts → buildMetadata()` with title, description, canonical, OG and Twitter tags.
- `ProfessionalService` JSON-LD is mounted in the root layout (matches the original WP Yoast schema).
- Blog posts emit `BlogPosting` + `BreadcrumbList` JSON-LD.
- Dynamic OG images via `app/og/route.tsx` (Edge runtime, `ImageResponse`).

### URLs preserved from the live site

Static marketing pages — all present:

`/`, `/pipedrive-consultant/`, `/ai-consultants/`, `/zapier-consultants/`, `/active-campaign-consultants/`, `/pipedrive-zapier-active-campaign-services/`, `/projects/`, `/about-2/`, `/contact-2/`, `/privacy/`, `/testimonials/`, `/blog/`

Blog posts — 4 ported from `as_canvas_posts()` in the WordPress theme:

- `/how-to-know-when-your-pipedrive-setup-needs-rebuilding/`
- `/the-zapier-automations-every-sales-team-should-consider/`
- `/crm-migration-checklist-for-growing-teams/`
- `/where-ai-can-improve-crm-and-sales-operations/`

Case studies — 2 ported:

- `/automating-sales-outreach/`
- `/building-email-journeys-using-active-campaign/`

### Before launch — backfill the remaining content

The live WordPress sitemap lists more URLs than we have content for. Each one is a real ranking URL today; if it 404s after launch you will lose SEO equity. Backfill these into MDX before the DNS cutover:

**Posts to backfill** (create `content/posts/<slug>.mdx` for each):

- `how-to-promote-your-app-on-a-budget`
- `choosing-pipedrive-consultants`
- (+ any other historical post URLs in `/post-sitemap.xml`)

**Case studies to backfill** (create `content/case-studies/<slug>.mdx` for each):

- `taking-an-offline-lead-management-process-online-and-automating-it-through-pipedrive`
- `automating-lettings-agencys-process`
- `rw-invest`
- `rw-invest-ai`
- `safer-group-ai`

The fastest way: visit the live URL, copy the article body, paste into a new `.mdx` file with the frontmatter shape used by the existing posts. Title and description should match the live `<title>` and `<meta name="description">` so meta does not regress.

## Contact form

The form on `/contact-2/` posts to a Server Action (`app/contact-2/actions.ts`) which calls `lib/mailer.ts` (Resend SDK). Required env vars:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CONTACT_TO=hello@automated-sales.com
CONTACT_FROM="Automated Sales <onboarding@resend.dev>"
```

Setup (one-time, ~2 minutes):

1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day, no credit card).
2. Go to **API Keys** → create a new key with full access.
3. Paste it into `.env.local` (dev) and Vercel project env vars (prod).
4. Set `CONTACT_TO` to whatever inbox should receive enquiries.

The default `CONTACT_FROM` uses Resend's own verified domain (`onboarding@resend.dev`) so this works immediately with no domain setup. Replies from your team's inbox go directly to the prospect because the Server Action sets `Reply-To` to the prospect's email — so it behaves exactly like a normal contact form.

When you're ready to send from your own domain (`hello@automated-sales.com`):

1. In Resend, go to **Domains** → add `automated-sales.com`.
2. Add the DNS records Resend provides (SPF, DKIM, optional DMARC) to your domain.
3. Wait for verification (usually < 15 minutes).
4. Update `CONTACT_FROM` to `"Automated Sales <hello@automated-sales.com>"` in Vercel.

Honeypot field + in-memory rate limit (5 submissions / minute / IP). For higher traffic switch the rate limiter to `@vercel/kv`.

## Deploy to Vercel

1. Push the `automated-sales-next/` folder to a Git repo.
2. Import into Vercel.
3. Add the env vars from `.env.example` in the Vercel dashboard (Settings → Environment Variables).
4. Build command and output directory: leave the Next.js defaults.
5. Once the preview deploy is green, point `automated-sales.com` DNS to Vercel.

## Acceptance checks before the DNS cutover

- [ ] `curl -I https://<preview>.vercel.app/<slug>/` returns 200 for every URL in the WordPress sitemap
- [ ] `curl -s https://<preview>.vercel.app/sitemap.xml | grep '<loc>' | wc -l` matches the live sitemap count
- [ ] `curl -s https://<preview>.vercel.app/robots.txt` references the sitemap
- [ ] Submit a contact form — email arrives at `CONTACT_TO`
- [ ] Run Lighthouse on home + one service page + one blog post — Performance ≥ 95, SEO = 100
- [ ] Paste home, one blog post, one case study schema into [Rich Results Test](https://search.google.com/test/rich-results) — green
- [ ] After cutover: submit new sitemap in Google Search Console; watch the "Pages with redirects" report for two weeks and add any URLs that show up as 404s to `next.config.ts → redirects()`.

## Adding a new blog post

1. Create `content/posts/<slug>.mdx`.
2. Add frontmatter:
   ```yaml
   ---
   title: "…"
   description: "150-character description"
   date: "2025-MM-DD"
   updated: "2025-MM-DD"     # optional
   category: "Pipedrive"     # optional
   author: "Automated Sales" # optional
   ogImage: "/images/og/…"   # optional — falls back to dynamic OG
   draft: false              # true to hide from sitemap and lists
   ---
   ```
3. Write MDX below.
4. Commit. The post is available at `/<slug>/` after the next deploy.

## Adding a new case study

Same as a post, but file goes in `content/case-studies/`. It appears on `/projects/` automatically.
# automated-sales
