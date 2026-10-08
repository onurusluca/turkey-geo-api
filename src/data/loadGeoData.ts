import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import type {
  District,
  GeoIndex,
  Maps,
  Neighborhood,
  Nuts,
  Province,
  Region,
  Street,
  Town,
  Village,
} from "../types";
import { streetTypeName } from "./streetTypes";

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toNuts(raw: unknown): Nuts | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const n1 = asRecord(obj.nuts1);
  const n2 = asRecord(obj.nuts2);
  const n1Name = n1 ? asRecord(n1.name) : null;
  const nuts3 = asString(obj.nuts3);
  if (
    !n1 ||
    !n2 ||
    !n1Name ||
    typeof n1.code !== "string" ||
    typeof n2.code !== "string" ||
    typeof n2.name !== "string" ||
    typeof n1Name.en !== "string" ||
    typeof n1Name.tr !== "string" ||
    nuts3 === null
  ) {
    return null;
  }
  return {
    nuts1: { code: n1.code, name: { en: n1Name.en, tr: n1Name.tr } },
    nuts2: { code: n2.code, name: n2.name },
    nuts3,
  };
}

function toMaps(raw: unknown): Maps | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const googleMaps = asString(obj.googleMaps);
  const openStreetMap = asString(obj.openStreetMap);
  if (googleMaps === null || openStreetMap === null) return null;
  return { googleMaps, openStreetMap };
}

function toRegion(raw: unknown): Region | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const en = asString(obj.en);
  const tr = asString(obj.tr);
  if (en === null || tr === null) return null;
  return { en, tr };
}

function toProvince(raw: Record<string, unknown>): Province {
  const coords = asRecord(raw.coordinates);
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
    isCoastal: typeof raw.is_coastal === "boolean" ? raw.is_coastal : null,
    isMetropolitan:
      typeof raw.is_metropolitan === "boolean" ? raw.is_metropolitan : null,
    nuts: toNuts(raw.nuts),
    coordinates:
      coords !== null
        ? {
            latitude: (coords.latitude as number | undefined) ?? null,
            longitude: (coords.longitude as number | undefined) ?? null,
          }
        : null,
    maps: toMaps(raw.maps),
    region: toRegion(raw.region),
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
    parentRegistrationId: (raw.parent_registration_id ?? null) as number | null,
    municipalityTypeCode: (raw.municipality_type_code ?? null) as number | null,
    neighborhoodTypeCode: (raw.neighborhood_type_code ?? null) as number | null,
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
  const typeCode = (raw.type_code ?? null) as number | null;
  return {
    id: raw.id as number,
    provinceId: raw.province_id as number,
    districtId: raw.district_id as number,
    neighborhoodId: raw.neighborhood_id as number,
    neighborhoodRegistrationNo: (raw.neighborhood_registration_no ??
      null) as number | null,
    typeCode,
    typeName: streetTypeName(typeCode),
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

function pushIndex<T>(map: Map<number, T[]>, key: number, value: T): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}

let current: GeoIndex | undefined;

export function getGeo(): GeoIndex {
  if (!current) {
    throw new Error("Geo data not loaded. Call loadGeoData first.");
  }
  return current;
}

export function loadGeoData(dir: string): GeoIndex {
  if (!existsSync(dir)) {
    throw new Error(
      `Geo data directory not found: ${dir}. Set GEO_DATA_DIR or place JSONL under data/jsonl.`
    );
  }

  const provincesPath = join(dir, "provinces.jsonl");
  if (!existsSync(provincesPath)) {
    throw new Error(`Missing ${provincesPath}`);
  }

  const provinces: Province[] = readJsonl(provincesPath).map(toProvince);
  const provinceById = new Map<number, Province>(
    provinces.map((p) => [p.id, p])
  );

  const provinceDirs = readdirSync(dir)
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
  const districtsByProvinceId = new Map<number, District[]>();
  const neighborhoodsByProvinceId = new Map<number, Neighborhood[]>();
  const neighborhoodsByDistrictId = new Map<number, Neighborhood[]>();
  const streetsByProvinceId = new Map<number, Street[]>();
  const streetsByDistrictId = new Map<number, Street[]>();
  const streetsByNeighborhoodId = new Map<number, Street[]>();
  const townsByProvinceId = new Map<number, Town[]>();
  const villagesByProvinceId = new Map<number, Village[]>();

  for (const folder of provinceDirs) {
    const pid = Number(folder.replace("province-", ""));
    const provinceName = provinceById.get(pid)?.name ?? "";

    for (const raw of readJsonl(join(dir, folder, "districts.jsonl"))) {
      const d = toDistrict(raw, provinceName);
      districts.push(d);
      districtById.set(d.id, d);
      pushIndex(districtsByProvinceId, d.provinceId, d);
    }

    for (const raw of readJsonl(join(dir, folder, "neighborhoods.jsonl"))) {
      const did = raw.district_id as number;
      const districtName = districtById.get(did)?.name ?? "";
      const n = toNeighborhood(raw, provinceName, districtName);
      neighborhoods.push(n);
      neighborhoodById.set(n.id, n);
      pushIndex(neighborhoodsByProvinceId, n.provinceId, n);
      pushIndex(neighborhoodsByDistrictId, n.districtId, n);
    }

    for (const raw of readJsonl(join(dir, folder, "streets.jsonl"))) {
      const did = raw.district_id as number;
      const nid = raw.neighborhood_id as number;
      const neigh = neighborhoodById.get(nid);
      const districtName = districtById.get(did)?.name ?? "";
      const neighborhoodName = neigh?.name ?? neigh?.fullOfficialName ?? "";
      const s = toStreet(
        raw,
        provinceName,
        districtName,
        String(neighborhoodName)
      );
      streets.push(s);
      pushIndex(streetsByProvinceId, s.provinceId, s);
      pushIndex(streetsByDistrictId, s.districtId, s);
      pushIndex(streetsByNeighborhoodId, s.neighborhoodId, s);
    }

    for (const raw of readJsonl(join(dir, folder, "towns.jsonl"))) {
      const t = toTown(raw);
      towns.push(t);
      pushIndex(townsByProvinceId, t.provinceId, t);
    }

    for (const raw of readJsonl(join(dir, folder, "villages.jsonl"))) {
      const v = toVillage(raw);
      villages.push(v);
      pushIndex(villagesByProvinceId, v.provinceId, v);
    }
  }

  current = {
    root: dir,
    provinces,
    districts,
    neighborhoods,
    streets,
    towns,
    villages,
    provinceById,
    districtById,
    neighborhoodById,
    streetById: new Map(streets.map((s) => [s.id, s])),
    townById: new Map(towns.map((t) => [t.id, t])),
    villageById: new Map(villages.map((v) => [v.id, v])),
    districtsByProvinceId,
    neighborhoodsByProvinceId,
    neighborhoodsByDistrictId,
    streetsByProvinceId,
    streetsByDistrictId,
    streetsByNeighborhoodId,
    townsByProvinceId,
    villagesByProvinceId,
  };
  return current;
}
