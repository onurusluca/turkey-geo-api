import { describe, expect, test } from "bun:test";
import { join } from "path";
import { loadGeoData } from "../src/data/loadGeoData";
import { streetTypeName } from "../src/data/streetTypes";

const fixtureDir = join(import.meta.dir, "fixtures", "jsonl");

describe("streetTypeName", () => {
  test("maps known UAVT type codes", () => {
    expect(streetTypeName(0)).toBe("Köy Sokağı");
    expect(streetTypeName(3)).toBe("Cadde");
    expect(streetTypeName(4)).toBe("Sokak");
    expect(streetTypeName(5)).toBe("Küme Evler");
    expect(streetTypeName(99)).toBeNull();
    expect(streetTypeName(null)).toBeNull();
  });
});

describe("loadGeoData", () => {
  const geo = loadGeoData(fixtureDir);

  test("loads fixture counts and parent indexes", () => {
    expect(geo.provinces).toHaveLength(2);
    expect(geo.districts).toHaveLength(3);
    expect(geo.neighborhoods).toHaveLength(3);
    expect(geo.streets).toHaveLength(3);
    expect(geo.towns).toHaveLength(1);
    expect(geo.villages).toHaveLength(1);
    expect(geo.districtsByProvinceId.get(34)).toHaveLength(2);
    expect(geo.neighborhoodsByDistrictId.get(1620)).toHaveLength(2);
    expect(geo.streetsByNeighborhoodId.get(100)).toHaveLength(2);
    expect(geo.streetsByProvinceId.get(35) ?? []).toHaveLength(0);
  });

  test("sets street typeName from typeCode", () => {
    expect(geo.streetById.get(1)?.typeName).toBe("Cadde");
    expect(geo.streetById.get(2)?.typeName).toBe("Sokak");
    expect(geo.streetById.get(3)?.typeName).toBe("Küme Evler");
  });

  test("tightens nuts, maps, and region", () => {
    const istanbul = geo.provinceById.get(34);
    expect(istanbul?.nuts?.nuts1.code).toBe("TR1");
    expect(istanbul?.maps?.openStreetMap).toContain("openstreetmap.org");
    expect(istanbul?.region?.tr).toBe("Marmara");
  });
});
