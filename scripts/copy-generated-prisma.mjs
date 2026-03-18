import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const projectRootPath = path.resolve(currentDirectoryPath, "..");
const sourcePath = path.join(projectRootPath, "generated", "prisma");
const distGeneratedRootPath = path.join(projectRootPath, "dist", "generated");
const destinationPath = path.join(distGeneratedRootPath, "prisma");

if (!existsSync(sourcePath)) {
  throw new Error("Generated Prisma client was not found. Run `npx prisma generate` first.");
}

mkdirSync(distGeneratedRootPath, { recursive: true });
rmSync(destinationPath, { recursive: true, force: true });
cpSync(sourcePath, destinationPath, { recursive: true });
