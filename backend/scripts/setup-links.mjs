#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const useJunction = process.platform === "win32";

const links = [
  ["app", "frontend/app"],
  ["public", "frontend/public"],
  ["actions", "backend/actions"],
  ["server", "backend/server"],
  ["drizzle", "backend/drizzle"],
  ["backend/.generated", ".generated"],
];

function lstatOrNull(target) {
  try {
    return fs.lstatSync(target);
  } catch {
    return null;
  }
}

function pointsAt(linkPath, targetPath) {
  try {
    return fs.realpathSync(linkPath) === fs.realpathSync(targetPath);
  } catch {
    return false;
  }
}

let problems = 0;

for (const [linkRel, targetRel] of links) {
  const linkPath = path.join(root, linkRel);
  const targetPath = path.join(root, targetRel);

  if (linkRel === "backend/.generated") {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  if (!fs.existsSync(targetPath)) {
    console.error(`missing target: ${targetRel}`);
    problems += 1;
    continue;
  }

  const stat = lstatOrNull(linkPath);
  if (!stat) {
    try {
      fs.symlinkSync(targetPath, linkPath, useJunction ? "junction" : "dir");
      console.log(`created ${linkRel} -> ${targetRel}`);
    } catch (error) {
      console.error(
        `could not create ${linkRel}: ${error instanceof Error ? error.message : error}`,
      );
      problems += 1;
    }
    continue;
  }

  if (stat.isSymbolicLink()) {
    if (pointsAt(linkPath, targetPath)) {
      console.log(`ok      ${linkRel} -> ${targetRel}`);
    } else {
      console.error(`wrong link: ${linkRel} points somewhere else`);
      problems += 1;
    }
    continue;
  }

  console.error(
    `conflict: ${linkRel} exists as a real ${stat.isDirectory() ? "directory" : "file"}; move it aside and rerun`,
  );
  problems += 1;
}

if (problems > 0) {
  console.error(`\nsetup:links finished with ${problems} problem(s).`);
  process.exitCode = 1;
} else {
  console.log("\nsetup:links complete.");
}
