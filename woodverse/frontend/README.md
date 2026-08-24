# WoodVerse Web

React frontend for WoodVerse.

## Stack

- React 18
- Vite
- Tailwind CSS
- Socket.IO Client
- Three.js (for 3D customization)

## Source Structure

- `src/pages/customer/` - Customer marketplace and checkout pages
- `src/pages/vendor/` - Vendor operations portal
- `src/pages/admin/` - Admin console
- `src/pages/supplier/` - Supplier portal
- `src/components/` - Shared UI components
- `src/data/` - Frontend mock/fallback data
- `src/utils.js` - Client-side helpers (API requests, routing, formatting)

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
