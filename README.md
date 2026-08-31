# Pawsphere

Pawsphere is a Vite + React + TypeScript frontend for the Pawsphere project — a pet-focused web app (UI, maps, and 3D views). This repository contains the frontend application and some database migrations; note that the `supabase/` directory was not intentionally placed and can be removed or moved later.

## Stack

- Language: TypeScript
- Framework: Vite + React 18 (with TypeScript)
- Styling: Tailwind CSS
- Notable libraries: three, @react-three/fiber, react-leaflet, @supabase/supabase-js

## Quick start

1. Install dependencies

```bash
npm install
```

2. Start the dev server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview the production build

```bash
npm run preview
```

## Required environment variables

- Copy `.env.example` to `.env` and set the values before running the app. The repository includes a `.env.example` with the expected variables.

## Repository layout (top-level)

- src/              — application source (entry: `src/main.tsx`, `src/App.tsx`)
- index.html        — Vite HTML entry
- package.json      — scripts and dependencies
- tsconfig.json     — TypeScript config
- vite.config.ts    — Vite config
- tailwind.config.js, postcss.config.js
- pawsphere-main/   — a duplicated copy of the project (suggest removing or merging)
- supabase/         — database migrations / SQL (note: not intentionally placed)

## Notes & cleanup suggestions

- Duplicate project: There is a near-duplicate project under `pawsphere-main/`. This duplication is confusing for contributors and CI. Decide which copy should be canonical and remove or merge the other one.

- Supabase contents: The `supabase/` directory appears in the repo but was not intentionally placed. I can either remove it, move it to an `archive/` folder, or open a PR to relocate it — tell me which you prefer.

- Lockfile: After merging or moving files, regenerate `package-lock.json` (`npm ci` / `npm install`) and commit the updated lockfile to avoid dependency drift.

## Contributing

- Add CI (e.g., GitHub Actions) to run `npm ci` and `npm run build` on push/PRs.
- If you keep the nested copy, add a README inside `pawsphere-main/` explaining why it exists.

## License

Add a LICENSE file if you plan to open-source this repository.
