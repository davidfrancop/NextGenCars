/*
NextGen Cars - Full Remix App Server (no Express) with:
- Prisma (PostgreSQL)
- GraphQL via graphql-yoga
- Input validation via Valibot

Project Structure:

package.json
tsconfig.json
remix.config.js
prisma/schema.prisma
.env
app/
├─ entry.server.tsx
├─ root.tsx
├─ graphql/
│  ├─ context.ts
│  ├─ schema.ts
│  └─ resolvers.ts
├─ validations/
│  └─ car.ts
└─ routes/
   ├─ graphql.ts
   └─ index.tsx
*/

// package.json
{
  "name": "nextgen-cars",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "remix dev",
    "build": "remix build",
    "start": "remix start"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "@remix-run/node": "^2.0.0",
    "@remix-run/react": "^2.0.0",
    "graphql": "^16.0.0",
    "graphql-yoga": "^3.0.0",
    "valibot": "^0.30.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^18.0.0"
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "lib": ["DOM", "ESNext"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["remix.env.d.ts", "app"]
}

// remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  server: "app/entry.server.tsx",
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/"
};

// .env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/nextgen_cars

// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Car {
  id        Int      @id @default(autoincrement())
  make      String
  model     String
  year      Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// app/entry.server.tsx
import { createRequestHandler } from "@remix-run/node";
import * as build from "@remix-run/dev/server-build";

export default createRequestHandler({
  build,
  mode: process.env.NODE_ENV
});

// app/root.tsx
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";

export const meta = () => ({ charset: "utf-8", title: "NextGen Cars", viewport: "width=device-width,initial-scale=1" });

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

// app/graphql/context.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;
if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;

type Context = { prisma: PrismaClient };
export function createContext(): Context {
  return { prisma };
}

// app/validations/car.ts
import { object, string, number, parse } from "valibot";

export const createCarSchema = object({
  make: string({ required_error: "Make is required" }),
  model: string({ required_error: "Model is required" }),
  year: number({ required_error: "Year is required" })
});

type CreateCarInput = Awaited<ReturnType<typeof parse<typeof createCarSchema>>>;
export type { CreateCarInput };

// app/graphql/schema.ts
import { makeExecutableSchema } from "@graphql-tools/schema";
import * as typeDefs from "graphql-tag";
import { createCarSchema } from "../validations/car";
import { parse } from "valibot";
import { createContext } from "./context";
import { PrismaClient } from "@prisma/client";

const typeDefinitions = /* GraphQL */`
  type Car {
    id: Int!
    make: String!
    model: String!
    year: Int!
  }

  input CreateCarInput {
    make: String!
    model: String!
    year: Int!
  }

  type Query {
    cars: [Car!]!
    car(id: Int!): Car
  }

  type Mutation {
    createCar(input: CreateCarInput!): Car!
  }
`;

export const schema = makeExecutableSchema({
  typeDefs: typeDefinitions,
  resolvers: {
    Query: {
      cars: async (_parent, _args, ctx: { prisma: PrismaClient }) => {
        return ctx.prisma.car.findMany();
      },
      car: async (_parent, args: { id: number }, ctx: { prisma: PrismaClient }) => {
        return ctx.prisma.car.findUnique({ where: { id: args.id } });
      }
    },
    Mutation: {
      createCar: async (_parent, args: { input: unknown }, ctx: { prisma: PrismaClient }) => {
        const validated = await parse(createCarSchema, args.input);
        return ctx.prisma.car.create({ data: validated });
      }
    }
  }
});

// app/graphql/resolvers.ts
// (Resolvers are in schema.ts above)

// app/routes/graphql.ts
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { createYoga } from "graphql-yoga";
import { schema } from "../graphql/schema";
import { createContext } from "../graphql/context";

const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: "/graphql"
});

export const loader = async ({ request }: LoaderArgs) => yoga.handleRequest(request);
export const action = async ({ request }: ActionArgs) => yoga.handleRequest(request);

// app/routes/index.tsx
import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Welcome to NextGen Cars</h1>
      <p>Try the <Link to="/graphql">GraphQL Playground</Link></p>
    </main>
  );
}
