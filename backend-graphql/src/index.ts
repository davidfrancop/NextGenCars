// backend-graphql/src/index.ts

import "dotenv/config"
import { createServer } from "node:http"
import { createYoga } from "graphql-yoga"
import { schema } from "./schema"
import { createContext, type Context } from "./context"
import os from "node:os"

/** Obtiene la IP de la red local (útil para testear en móviles de la misma LAN) */
function getLanIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address
    }
  }
  return "127.0.0.1"
}

const PORT = Number(process.env.PORT ?? 4000)
const HOST = process.env.HOST ?? "0.0.0.0"
const FALLBACK_PUBLIC = getLanIP()
const PUBLIC_HOST = process.env.PUBLIC_HOST || FALLBACK_PUBLIC

/** Permitir orígenes declarados por ENV o localhost/LAN por defecto */
const corsOrigins =
  process.env.CORS_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [
    `http://localhost:5173`,
    `http://${PUBLIC_HOST}:5173`,
  ]

/** Instancia Yoga (GraphQL) */
const yoga = createYoga<Context>({
  schema,
  context: createContext,
  graphiql: true,
  cors: {
    origin: corsOrigins,
    credentials: false, // Pon true solo si vas a usar cookies
  },
})

/**
 * Servidor HTTP con healthchecks simples.
 * Pasamos las demás rutas a Yoga (GraphQL).
 */
const server = createServer((req, res) => {
  if (req.url === "/healthz") {
    res.statusCode = 200
    res.setHeader("content-type", "application/json; charset=utf-8")
    res.end(JSON.stringify({ ok: true }))
    return
  }
  if (req.url === "/readyz") {
    res.statusCode = 200
    res.setHeader("content-type", "application/json; charset=utf-8")
    res.end(JSON.stringify({ ready: true }))
    return
  }
  // Delegar al handler de Yoga (todas las rutas GraphQL)
  return yoga(req, res)
})

server.on("error", (err) => {
  console.error("❌ HTTP server error:", err)
})

server.listen(PORT, HOST, () => {
  console.log("🚀 GraphQL server ready at:")
  console.log(`   Local:   http://127.0.0.1:${PORT}/graphql`)
  console.log(`   LAN:     http://${PUBLIC_HOST}:${PORT}/graphql`)
  console.log(`   Health:  http://127.0.0.1:${PORT}/healthz  |  /readyz`)
})
