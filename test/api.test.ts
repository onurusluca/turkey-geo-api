import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Server } from "http";
import type { AddressInfo } from "net";
import { join } from "path";
import { createApp } from "../src/app";
import { loadGeoData } from "../src/data/loadGeoData";
import { MAX_LIMIT } from "../src/utils/pagination";

const fixtureDir = join(import.meta.dir, "fixtures", "jsonl");

let server: Server;
let base = "";

beforeAll(async () => {
  loadGeoData(fixtureDir);
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve());
  });
  const addr = server.address() as AddressInfo;
  base = `http://127.0.0.1:${addr.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function getJson(path: string): Promise<{
  status: number;
  body: Record<string, unknown>;
  requestId: string | null;
}> {
  const res = await fetch(`${base}${path}`);
  return {
    status: res.status,
    body: (await res.json()) as Record<string, unknown>,
    requestId: res.headers.get("x-request-id"),
  };
}

describe("API", () => {
  test("paginates collections", async () => {
    const res = await getJson("/api/provinces?limit=1&offset=0");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.limit).toBe(1);
    expect(res.body.offset).toBe(0);
    expect(res.body.items).toHaveLength(1);
  });

  test("Turkish q matches İ/i", async () => {
    const provinces = await getJson("/api/provinces?q=istan");
    expect(provinces.status).toBe(200);
    expect(provinces.body.total).toBe(1);
    const items = provinces.body.items as Array<{ name: string }>;
    expect(items[0]?.name).toBe("İSTANBUL");

    const streets = await getJson("/api/streets?q=inci");
    expect(streets.status).toBe(200);
    expect(streets.body.total).toBe(1);
  });

  test("returns 404 for unknown id", async () => {
    const res = await getJson("/api/provinces/999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Province not found");
    expect(res.requestId).toBeTruthy();
    expect(res.body.requestId).toBe(res.requestId);
  });

  test("returns 400 for invalid id", async () => {
    const res = await getJson("/api/provinces/foo");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid Province ID");
  });

  test("rejects limit above MAX_LIMIT", async () => {
    const res = await getJson(`/api/provinces?limit=${MAX_LIMIT + 1}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(`limit must be at most ${MAX_LIMIT}`);
  });

  test("filters streets by neighborhood using indexes", async () => {
    const res = await getJson("/api/streets/neighborhood/100");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    const items = res.body.items as Array<{ neighborhoodId: number }>;
    expect(items.every((s) => s.neighborhoodId === 100)).toBe(true);
  });

  test("GET street includes typeName", async () => {
    const res = await getJson("/api/streets/1");
    expect(res.status).toBe(200);
    expect(res.body.typeCode).toBe(3);
    expect(res.body.typeName).toBe("Cadde");
  });

  test("nested province routes stay before /:id", async () => {
    const districts = await getJson("/api/districts/province/34");
    expect(districts.status).toBe(200);
    expect(districts.body.total).toBe(2);

    const towns = await getJson("/api/towns/province/34");
    expect(towns.status).toBe(200);
    expect(towns.body.total).toBe(1);

    const villages = await getJson("/api/villages/province/34");
    expect(villages.status).toBe(200);
    expect(villages.body.total).toBe(1);
  });

  test("unknown route is 404", async () => {
    const res = await getJson("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route not found");
  });
});
