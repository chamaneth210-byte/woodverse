# WoodVerse Web

React frontend for WoodVerse.

## Stack

- React 18
- Vite
- Tailwind CSS
- Socket.IO Client
- Three.js (for 3D customization)

## Source Structure

Each role portal lives in its own folder and holds one file per page, plus the
seed data and helpers only that portal needs. `index.jsx` in each folder
re-exports its pages, so importing from the folder still works.

- `src/pages/customer/` - Customer marketplace, cart, checkout, and auth pages
- `src/pages/vendor/` - Vendor operations portal
- `src/pages/supplier/` - Supplier portal
- `src/pages/admin/` - Admin console
- `src/config/routes.jsx` - Route table, role guards, and lazy page loaders
- `src/components/` - Shared UI components
- `src/lib/` - Helpers shared across portals (localStorage lists, admin events)
- `src/data/` - Frontend mock/fallback data
- `src/utils.js` - Client-side helpers (API requests, routing, formatting)

Inside a portal folder, files are named by role:

- `XxxPage.jsx` - a single page component
- `seed.js` / `storageKeys.js` - demo data and localStorage key names
- `shared.jsx` / `*Parts.jsx` - components used by several pages in that portal
- `format.js` / `tone.js` / `i18n.js` - pure helper functions

## Local Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend listens on `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Environment

- `VITE_API_URL` - Backend API URL. Default: `http://localhost:4000`
