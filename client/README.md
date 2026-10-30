# Lunella Client

Ethnic wear storefront (React + Vite + Tailwind). Every homepage section is a
component under `src/components/home`, and all of its copy, photos and section
switches live in `src/data/siteContent.json` and `src/data/sectionVisibility.json`.

## Run the client

1. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend API URL.
2. Run `npm install` once.
3. Run `npm run dev`.

## Simple API flow

```text
Page or component → Redux slice → module service → shared Axios API → Express API
```

The module service files live in `src/services`, Redux slices live in `src/slices`, and the shared Redux store/provider live in `src/app`.
