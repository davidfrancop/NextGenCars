#!/usr/bin/env node

// stop-all.mjs — Stop all running dev servers from NextGenCars (only works if started with dev-all.mjs)

import { exec } from "child_process";

const processesToKill = [
  "backend-graphql",
  "control",
  "web"
];

const command = process.platform === "win32" ? "taskkill /F /IM node.exe" : "pkill -f node";

console.log("🛑 Stopping all NextGenCars services...");

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error while stopping processes: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log("✅ All Node.js processes stopped.");
});
