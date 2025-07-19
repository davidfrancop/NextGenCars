#!/usr/bin/env node

// dev-all.mjs - Start all NextGenCars services in parallel

import { exec } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const servicios = [
  { nombre: "backend-graphql", comando: "npm run dev", ruta: join(__dirname, "backend-graphql") },
  { nombre: "control", comando: "npm run dev", ruta: join(__dirname, "control") },
  { nombre: "web", comando: "npm run dev", ruta: join(__dirname, "web") },
];

servicios.forEach(({ nombre, comando, ruta }) => {
  const proceso = exec(comando, { cwd: ruta });

  proceso.stdout.on("data", data => {
    process.stdout.write(`[${nombre}] ${data}`);
  });

  proceso.stderr.on("data", data => {
    process.stderr.write(`[${nombre} ERROR] ${data}`);
  });

  proceso.on("exit", code => {
    console.log(`[${nombre}] exited with code ${code}`);
  });
});
