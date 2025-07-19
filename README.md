# NextGenCars 🚗

A complete project split into three main services:

- `backend-graphql/`: GraphQL server with Prisma and PostgreSQL
- `control/`: Admin intranet built with Remix
- `web/`: Public-facing website built with Remix

---

## 📁 Project Structure

```
NextGenCars/

├── backend-graphql/
│   ├── .env                      # Environment variables
│   ├── .gitignore               # Files to ignore in Git
│   ├── package-lock.json
│   ├── package.json             # Project config and scripts
│   └── prisma/
│       └── schema.prisma        # Prisma data model

├── control/
│   ├── .eslintrc.cjs
│   ├── .gitignore               # Git ignore config
│   ├── README.md                # Project documentation
│   ├── app/
│   │   ├── entry.client.tsx
│   │   ├── entry.server.tsx
│   │   ├── root.tsx
│   │   ├── routes/
│   │   │   └── _index.tsx
│   │   └── tailwind.css
│   ├── package-lock.json
│   ├── package.json             # Project config and scripts
│   ├── postcss.config.js
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo-dark.png
│   │   └── logo-light.png
│   ├── tailwind.config.ts
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite + Remix configuration

└── web/
    ├── .eslintrc.cjs
    ├── .gitignore               # Git ignore config
    ├── README.md                # Project documentation
    ├── app/
    │   ├── entry.client.tsx
    │   ├── entry.server.tsx
    │   ├── root.tsx
    │   ├── routes/
    │   │   └── _index.tsx
    │   └── tailwind.css
    ├── package-lock.json
    ├── package.json             # Project config and scripts
    ├── postcss.config.js
    ├── public/
    │   ├── favicon.ico
    │   ├── logo-dark.png
    │   └── logo-light.png
    ├── tailwind.config.ts
    ├── tsconfig.json            # TypeScript configuration
    └── vite.config.ts           # Vite + Remix configuration
```

---

## 🚀 Quick Start

```bash
# 1. Clone the project
git clone https://github.com/YOUR_USERNAME/NextGenCars.git
cd NextGenCars

# 2. Install dependencies for each service
cd backend-graphql && npm install
cd ../control && npm install
cd ../web && npm install

# 3. Run the services
# GraphQL backend
cd ../backend-graphql && npm run dev

# Admin intranet (Remix)
cd ../control && npm run dev

# Public web (Remix)
cd ../web && npm run dev
```

---

## 🧱 Tech Stack

- **Remix App Server** + Vite (`control/`, `web/`)
- **GraphQL Yoga** + Prisma (`backend-graphql/`)
- **PostgreSQL** as database
- **Tailwind CSS** and **Valibot** used across all services
