import "dotenv/config";
import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { networkInterfaces } from "node:os";
import { schema } from "./schema";
import { context, type Context } from "./context";

function getLocalIp(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address; // Devuelve la primera IP LAN encontrada
      }
    }
  }
  return "127.0.0.1"; // Fallback
}

const yoga = createYoga<Context>({
  schema,
  context,
  graphiql: true,
});

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";

const server = createServer(yoga);

server.listen(PORT, HOST, () => {
  const localIp = getLocalIp();
  console.log(`🚀 GraphQL server ready at:`);
  console.log(`   Local:   http://127.0.0.1:${PORT}/graphql`);
  console.log(`   LAN:     http://${localIp}:${PORT}/graphql`);
});
