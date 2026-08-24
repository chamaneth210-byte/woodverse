# WoodVerse

## Document Information

- Project: WoodVerse
- Status: Draft
- Version: 1.0
- Last Updated: To be updated
- Owner: WoodVerse Development Team

## Project Context

WoodVerse is an AI-assisted multi-vendor web platform for furniture,
wooden products, wooden gifts, standard laser-cut files, indoor plants,
custom furniture, supplier management, inventory, production tracking,
payments, shipments, support, and administration.

Main roles:

- Customer
- Vendor / Seller
- Supplier
- Support Staff
- System Administrator

Technology stack:

- React.js
- Tailwind CSS
- Node.js
- Express.js
- PostgreSQL
- Python
- FastAPI
- Scikit-learn
- OpenCV
- MiDaS / DPT
- Socket.IO


## Overview

WoodVerse is a multi-role platform for furniture ecommerce, product
customization, vendor operations, suppliers, production tracking, inventory,
payments, shipments, AI assistance, support, and administration.

## Repository Structure

```
woodverse/
├── package.json          # Root monorepo config (npm workspaces)
├── frontend/             # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── customer/   # Customer-facing pages
│   │   │   ├── vendor/     # Vendor portal pages
│   │   │   ├── admin/      # Admin console pages
│   │   │   └── supplier/   # Supplier portal pages
│   │   ├── components/     # Shared UI components
│   │   ├── data/           # Frontend mock data
│   │   └── utils.js        # Client-side helpers
│   └── package.json
├── backend/              # Backend services
│   ├── api/              # Node.js/Express backend
│   │   ├── src/
│   │   │   ├── routes/    # Modular route handlers
│   │   │   ├── utils/     # Shared server utilities
│   │   │   ├── data/      # In-memory fallback data
│   │   │   ├── socket.js  # Socket.IO handlers
│   │   │   ├── db.js      # PostgreSQL connection
│   │   │   └── server.js  # Entry point
│   │   └── package.json
│   └── ai-service/       # Python FastAPI AI service
│       ├── src/
│       │   └── main.py
│       └── requirements.txt
├── database/             # PostgreSQL schema and migrations
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
└── docs/                 # Product, architecture, API, security, testing, and deployment docs
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Python >= 3.10 (for AI service)

### Install

```bash
cd woodverse
npm run install:all
```

### Development

```bash
# Run all services
npm run dev

# Or run individually
npm run dev:web    # Frontend at http://localhost:5173
npm run dev:api    # Backend at http://localhost:4000
npm run dev:ai     # AI service at http://localhost:8000
```

### Build

```bash
npm run build
```

## Documentation

Start with:

- `docs/FULL_SYSTEM_DOCUMENTATION.md`
- `docs/architecture/SYSTEM_ARCHITECTURE.md`
- `docs/phases/IMPLEMENTATION_ROADMAP.md`
