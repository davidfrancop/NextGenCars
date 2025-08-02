// Archivo: generarEstructuraNextGen.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Emula __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ignorar = ["node_modules", ".git", "dist", ".DS_Store", "build", "generated"];

const comentarios = {
  ".env": "# Variables de entorno",
  ".gitignore": "# Ignorar en Git",
  "package.json": "# Configuración y scripts del proyecto",
  "vite.config.ts": "# Configuración de Vite + Remix",
  "tsconfig.json": "# Configuración de TypeScript",
  "schema.prisma": "# Definición del esquema Prisma",
  "server.ts": "# Yoga GraphQL server",
  "schema.ts": "# Definición del esquema GraphQL",
  "context.ts": "# Contexto de Prisma para resolvers",
  "README.md": "# Documentación del proyecto"
};

function imprimirArbol(dir, prefijo = "") {
  const archivos = fs.readdirSync(dir).filter(f => !ignorar.includes(f));
  archivos.sort();

  archivos.forEach((archivo, i) => {
    const ruta = path.join(dir, archivo);
    const esUltimo = i === archivos.length - 1;
    const simbolo = esUltimo ? "└──" : "├──";
    const comentario = comentarios[archivo] ? "  " + comentarios[archivo] : "";
    console.log(`${prefijo}${simbolo} ${archivo}${comentario}`);

    if (fs.statSync(ruta).isDirectory()) {
      const nuevoPrefijo = prefijo + (esUltimo ? "    " : "│   ");
      imprimirArbol(ruta, nuevoPrefijo);
    }
  });
}

console.log("NextGenCars/\n");
["backend-graphql", "control", "web"].forEach((carpeta, i, arr) => {
  const esUltimo = i === arr.length - 1;
  const simbolo = esUltimo ? "└──" : "├──";
  console.log(`${simbolo} ${carpeta}/`);
  imprimirArbol(path.join(__dirname, carpeta), esUltimo ? "    " : "│   ");
});
