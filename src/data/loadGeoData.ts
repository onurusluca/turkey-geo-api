import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { config } from "../config";
import type {
  District,
  Neighborhood,
  Province,
  Street,
  Town,
  Village,
} from "../types";

function readJsonl(filePath: string): Record<string, unknown>[] {
  if (!existsSync(filePath)) {
    return [];
  }
  const text = readFileSync(filePath, "utf-8");
  const lines = text.split("\n");
  const out: Record<string, unknown>[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    out.push(JSON.parse(t) as Record<string, unknown>);
  }
  return out;
}

function toProvince(raw: Record<string, unknown>): Province {
  const coords = raw.coordinates as
    | { latitude?: number; longitude?: number }
    | undefined;
  return {
    id: raw.id as number,
    registrationNo: (raw.registration_no ?? null) as number | null,
    name: String(raw.name),
    fullOfficialName: (raw.full_official_name ?? null) as string | null,
    population: (raw.population ?? null) as number | null,
    area: (raw.area ?? null) as number | null,
    postalCode: (raw.postal_code ?? null) as string | null,
    altitude: (raw.altitude ?? null) as number | null,
    areaCodes: (raw.area_codes ?? null) as number[] | null,
    isCoastal:
      typeof raw.is_coastal === "boolean" ? raw.is_coastal : null,
    isMetropolitan:
      typeof raw.is_metropolitan === "boolean" ? raw.is_metropolitan : null,
    nuts: (raw.nuts ?? null) as Record<string, unknown> | null,
    coordinates:
      coords !== undefined
        ? {
            latitude: coords.latitude ?? null,
            longitude: coords.longitude ?? null,
          }
        : null,
    maps: (raw.maps ?? null) as Record<string, unknown> | null,
    region: (raw.region ?? null) as Record<string, unknown> | null,
  };
}

function toDistrict(
  raw: Record<string, unknown>,
  provinceName: string
): District {
  return {
    id: raw.id as number,
    provinceId: raw.province_id as number,
    registrationNo: (raw.registration_no ?? null) as number | null,
    name: String(raw.name),
    fullOfficialName: (raw.full_official_name ?? null) as string | null,
    population: (raw.population ?? null) as number | null,
    area: (raw.area ?? null) as number | null,
    postalCode: (raw.postal_code ?? null) as string | null,
    provinceName,
  };
}

function toNeighborhood(
  raw: Record<string, unknown>,
  provinceName: string,
  districtName: string
): Neighborhood {
  return {
    id: raw.id as number,
    provinceId: raw.province_id as number,
    districtId: raw.district_id as number,
    parentRegistrationId: (raw.parent_registration_id ?? null) as
      | number
      | null,
    municipalityTypeCode: (raw.municipality_type_code ?? null) as
      | number
      | null,
    neighborhoodTypeCode: (raw.neighborhood_type_code ?? null) as
      | number
      | null,
    name: (raw.name ?? null) as string | null,
    fullOfficialName: (raw.full_official_name ?? null) as string | null,
    population: (raw.population ?? null) as number | null,
    provinceName,
    districtName,
  };
}

function toStreet(
  raw: Record<string, unknown>,
  provinceName: string,
  districtName: string,
  neighborhoodName: string
): Street {
  return {
    id: raw.id as number,
    provinceId: raw.province_id as number,
    districtId: raw.district_id as number,
    neighborhoodId: raw.neighborhood_id as number,
    neighborhoodRegistrationNo: (raw.neighborhood_registration_no ??
      null) as number | null,
    typeCode: (raw.type_code ?? null) as number | null,
    name: (raw.name ?? null) as string | null,
    fullOfficialName: (raw.full_official_name ?? null) as string | null,
    provinceName,
    districtName,
    neighborhoodName,
  };
}

function toTown(raw: Record<string, unknown>): Town {
  return {
    id: raw.id as number,
    provinceId: raw.province_id as number,
    districtId: raw.district_id as number,
    name: (raw.name ?? null) as string | null,
    population: (raw.population ?? null) as number | null,
    provinceName: (raw.province_name ?? null) as string | null,
    districtName: (raw.district_name ?? null) as string | null,
  };
}

function toVillage(raw: Record<string, unknown>): Village {
  return toTown(raw) as Village;
}

const root = config.geoDataDir;

if (!existsSync(root)) {
  throw new Error(
    `Geo data directory not found: ${root}. Set GEO_DATA_DIR or run the merge script (see README).`
  );
}

const provincesPath = join(root, "provinces.jsonl");
if (!existsSync(provincesPath)) {
  throw new Error(`Missing ${provincesPath}`);
}

const provinceRowsRaw = readJsonl(provincesPath);
const provinces: Province[] = provinceRowsRaw.map(toProvince);
const provinceById = new Map<number, Province>(
  provinces.map((p) => [p.id, p])
);

const provinceDirs = readdirSync(root)
  .filter((n) => /^province-\d+$/.test(n))
  .sort(
    (a, b) =>
      Number(a.replace("province-", "")) - Number(b.replace("province-", ""))
  );

const districts: District[] = [];
const neighborhoods: Neighborhood[] = [];
const streets: Street[] = [];
const towns: Town[] = [];
const villages: Village[] = [];

const districtById = new Map<number, District>();
const neighborhoodById = new Map<number, Neighborhood>();

for (const dir of provinceDirs.sort()) {
  const pid = Number(dir.replace("province-", ""));
  const p = provinceById.get(pid);
  const provinceName = p?.name ?? "";

  const dPath = join(root, dir, "districts.jsonl");
  for (const raw of readJsonl(dPath)) {
    const d = toDistrict(raw, provinceName);
    districts.push(d);
    districtById.set(d.id, d);
  }

  const nPath = join(root, dir, "neighborhoods.jsonl");
  for (const raw of readJsonl(nPath)) {
    const did = raw.district_id as number;
    const dist = districtById.get(did);
    const districtName = dist?.name ?? "";
    const n = toNeighborhood(raw, provinceName, districtName);
    neighborhoods.push(n);
    neighborhoodById.set(n.id, n);
  }

  const sPath = join(root, dir, "streets.jsonl");
  for (const raw of readJsonl(sPath)) {
    const did = raw.district_id as number;
    const nid = raw.neighborhood_id as number;
    const dist = districtById.get(did);
    const neigh = neighborhoodById.get(nid);
    const districtName = dist?.name ?? "";
    const neighborhoodName = neigh?.name ?? neigh?.fullOfficialName ?? "";
    streets.push(
      toStreet(raw, provinceName, districtName, String(neighborhoodName))
    );
  }

  const tPath = join(root, dir, "towns.jsonl");
  for (const raw of readJsonl(tPath)) {
    towns.push(toTown(raw));
  }

  const vPath = join(root, dir, "villages.jsonl");
  for (const raw of readJsonl(vPath)) {
    villages.push(toVillage(raw));
  }
}

const streetById = new Map<number, Street>(streets.map((s) => [s.id, s]));
const townById = new Map<number, Town>(towns.map((t) => [t.id, t]));
const villageById = new Map<number, Village>(villages.map((v) => [v.id, v]));

export const geo = {
  root,
  provinces,
  districts,
  neighborhoods,
  streets,
  towns,
  villages,
  provinceById,
  districtById,
  neighborhoodById,
  streetById,
  townById,
  villageById,
};
