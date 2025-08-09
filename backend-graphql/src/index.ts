import "dotenv/config"
import { createServer } from "node:http"
import { createYoga } from "graphql-yoga"
import { schema } from "./schema"
import { context, type Context } from "./context"
import os from "node:os"

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

// Permite orígenes declarados (o localhost/LAN por defecto)
const corsOrigins = (process.env.CORS_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean)) ?? [
  `http://localhost:5173`,
  `http://${PUBLIC_HOST}:5173`,
]

const yoga = createYoga<Context>({
  schema,
  context,
  graphiql: true,
  cors: {
    origin: corsOrigins,
    credentials: false, // si usaras cookies, poner true
  },
})

const server = createServer(yoga)

server.listen(PORT, HOST, () => {
  console.log("🚀 GraphQL server ready at:")
  console.log(`   Local:   http://127.0.0.1:${PORT}/graphql`)
  console.log(`   LAN:     http://${PUBLIC_HOST}:${PORT}/graphql`)
})
