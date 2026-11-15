# Project guidance

## What this project is

This is Katie and Jonathan's wedding website, built to match the look and feel of their wedding invitations. It currently introduces the event and collects guest contact details and weekend accommodation interest. The site is expected to grow to include food choices, weekend plans, payment details, and FAQs.

## Stack and structure

- Vue 3 single-page app using TypeScript, Vite, Vue Router, and Pinia.
- `src/views/HomeView.vue` contains the current wedding information and registration flow.
- `src/components/ui/` contains reusable form UI such as `WatercolorInput.vue`.
- `src/data/guests.ts` is the local guest roster, including invite-group IDs and weekend eligibility. Treat its contents as private personal data; do not reproduce guest names in docs, logs, examples, or commits unnecessarily.
- `src/services/supabase.ts` creates the Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `src/assets/main.scss` holds global theme styles. Images and the Beatrica script font are in `public/images/` and `public/fonts/`.
- The only configured route is `/`, which renders `HomeView.vue`.

## Product and design direction

- Preserve the invitation-inspired watercolor / botanical style: forest and sage greens, soft white and parchment backgrounds, floral/bird flourishes, script display lettering, and a readable serif for body copy.
- Keep the site warm, clear, and appropriate for wedding guests. Make added information (food, weekend schedule, payments, FAQs) easy to scan and usable on mobile.
- Keep form labels, validation, confirmation states, and error messages accessible and understandable. Avoid making layout or color changes that undermine contrast or readability.
- Event facts and guest-facing copy are specific to this wedding. Do not invent dates, venue details, prices, policies, or plans; use the existing content or ask for the missing information.

## Supabase and guest data

- The current app stores registration records in the `savethedate` table. Existing fields used by the UI include `guest_id`, `guest_name`, `email`, `phone`, `is_weekend_guest`, and `weekend_accommodation`; the app inserts a new row for each response and updates the newly created row for accommodation selection.
- The browser uses the Supabase anon key, which is expected to be public client configuration. Never add a service-role key or other secret to client code, committed files, or `VITE_` variables. Keep credentials in local environment configuration and ensure local env files are ignored by Git.
- Treat contact information and RSVP records as sensitive. Do not log submitted personal data, expose it in public pages, or weaken Supabase Row Level Security/policies. Database schema and policy changes must be coordinated with the Supabase project; client-side checks alone are not access control.
- When extending registration (such as meals or payments), keep the UI and database field names/types aligned, handle loading and failure states, and avoid changing existing RSVP semantics without a clear migration path. Never collect or store payment card details in this app; use an appropriate payment provider if payment functionality is introduced.
- The project is described as using Supabase's free plan. Avoid assuming a particular quota or capability; check the actual project settings before relying on one.

## Development workflow

- Use Node.js 26.13.0 and the repository's pnpm package manager (`packageManager` is `pnpm@12.21.0`) with `pnpm-lock.yaml`.
- Install dependencies with `pnpm install` and run the dev server with `pnpm dev`.
- Available checks: `pnpm type-check`, `pnpm test:unit`, and `pnpm build`. `pnpm lint` and `pnpm format` modify files (`--fix` / `--write`), so inspect their effects before using them.
- Keep changes focused and consistent with the existing Vue single-file component and TypeScript patterns. Do not edit generated output in `dist/` or commit secrets, local env files, or guest exports.
- Before changing a behavior or data contract, inspect its current usage and tests. Update tests and project documentation when behavior or setup changes.

## Deployment

- The site is published to GitHub Pages at `www.thegarrettwedding.co.uk` with `pnpm deploy`.
- `pnpm deploy` builds the app and publishes it. Only run it after all intended changes have been committed, so the deployed version maps to a commit that can be rolled back.
