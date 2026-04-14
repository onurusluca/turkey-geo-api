import { readFileSync } from "fs";
import { join } from "path";

let cached: string | undefined;

export function getAppVersion(): string {
  if (cached !== undefined) return cached;
  const pkgPath = join(__dirname, "..", "package.json");
  cached = JSON.parse(readFileSync(pkgPath, "utf-8")).version as string;
  return cached;
}
