import { isAbsolute, join } from "path";

function resolveGeoDataDir(): string {
  const env = process.env.GEO_DATA_DIR;
  if (!env) return join(process.cwd(), "data", "jsonl");
  return isAbsolute(env) ? env : join(process.cwd(), env);
}

export const config = {
  port: Number(process.env.PORT) || 8080,
  /** Comma-separated origins, e.g. `https://a.com,https://b.com`. If unset, CORS reflects the request origin. */
  corsOrigin: process.env.CORS_ORIGIN,
  nodeEnv: process.env.NODE_ENV ?? "development",
  /**
   * Root folder with `provinces.jsonl` and `province-{id}/` shards (JSONL).
   * Override with **`GEO_DATA_DIR`** (absolute path, or relative to process cwd). Default: `data/jsonl`.
   */
  geoDataDir: resolveGeoDataDir(),
};
