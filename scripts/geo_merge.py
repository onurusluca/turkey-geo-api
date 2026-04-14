"""
Shared merge logic: data-new (registry + streets) + data-more (enrichment).
Produces English-keyed dicts for JSON/SQLite export.
"""

from __future__ import annotations

import json
from collections.abc import Iterator
from pathlib import Path
from typing import Any


def iter_jsonl(path: Path) -> Iterator[dict[str, Any]]:
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            yield json.loads(line)


def load_json_array(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError(f"Expected JSON array in {path}")
    return data


def index_by_id(rows: list[dict[str, Any]], key: str = "id") -> dict[int, dict[str, Any]]:
    out: dict[int, dict[str, Any]] = {}
    for row in rows:
        k = row.get(key)
        if k is None:
            continue
        out[int(k)] = row
    return out


def json_bool_to_int(value: Any) -> int | None:
    if value is True:
        return 1
    if value is False:
        return 0
    return None


def province_ids_from_disk(data_new_root: Path) -> list[int]:
    ids: list[int] = []
    for p in sorted(data_new_root.glob("il-*")):
        if not p.is_dir():
            continue
        suffix = p.name.split("-", 1)[-1]
        if suffix.isdigit():
            ids.append(int(suffix))
    return sorted(ids)


def merge_province_row(raw: dict[str, Any], extra: dict[str, Any]) -> dict[str, Any]:
    pid = int(raw["kimlikNo"])
    coords = extra.get("coordinates") or {}
    lat = coords.get("latitude")
    lng = coords.get("longitude")
    coordinates = None
    if lat is not None or lng is not None:
        coordinates = {"latitude": lat, "longitude": lng}

    return {
        "id": pid,
        "registration_no": raw.get("ilKayitNo"),
        "name": raw["adi"],
        "full_official_name": raw.get("bilesenAdi"),
        "population": extra.get("population"),
        "area": extra.get("area"),
        "postal_code": extra.get("postalCode"),
        "altitude": extra.get("altitude"),
        "area_codes": extra.get("areaCode"),
        "is_coastal": extra.get("isCoastal"),
        "is_metropolitan": extra.get("isMetropolitan"),
        "nuts": extra.get("nuts"),
        "coordinates": coordinates,
        "maps": extra.get("maps"),
        "region": extra.get("region"),
    }


def merge_all_provinces(
    data_new_root: Path,
    more_provinces: dict[int, dict[str, Any]],
) -> list[dict[str, Any]]:
    iller = data_new_root / "iller.jsonl"
    return [
        merge_province_row(raw, more_provinces.get(int(raw["kimlikNo"]), {}))
        for raw in iter_jsonl(iller)
    ]


def province_row_to_sql_tuple(row: dict[str, Any]) -> tuple[Any, ...]:
    nuts = row.get("nuts")
    maps = row.get("maps")
    region = row.get("region")
    area_codes = row.get("area_codes")
    coords = row.get("coordinates") or {}
    return (
        row["id"],
        row.get("registration_no"),
        row["name"],
        row.get("full_official_name"),
        row.get("population"),
        row.get("area"),
        row.get("postal_code"),
        row.get("altitude"),
        json.dumps(area_codes) if area_codes is not None else None,
        json_bool_to_int(row.get("is_coastal")),
        json_bool_to_int(row.get("is_metropolitan")),
        json.dumps(nuts) if nuts is not None else None,
        (coords or {}).get("latitude"),
        (coords or {}).get("longitude"),
        json.dumps(maps) if maps is not None else None,
        json.dumps(region) if region is not None else None,
    )


def merge_district_row(raw: dict[str, Any], extra: dict[str, Any]) -> dict[str, Any]:
    did = int(raw["kimlikNo"])
    return {
        "id": did,
        "province_id": int(raw["il_id"]),
        "registration_no": raw.get("ilceKayitNo"),
        "name": raw["adi"],
        "full_official_name": raw.get("bilesenAdi"),
        "population": extra.get("population"),
        "area": extra.get("area"),
        "postal_code": extra.get("postalCode"),
    }


def merge_all_districts(
    data_new_root: Path,
    province_ids: list[int],
    more_districts: dict[int, dict[str, Any]],
) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for pid in province_ids:
        path = data_new_root / f"il-{pid}" / "ilceler.jsonl"
        if not path.is_file():
            continue
        for raw in iter_jsonl(path):
            did = int(raw["kimlikNo"])
            out.append(merge_district_row(raw, more_districts.get(did, {})))
    return out


def district_row_to_sql_tuple(row: dict[str, Any]) -> tuple[Any, ...]:
    return (
        row["id"],
        row["province_id"],
        row.get("registration_no"),
        row["name"],
        row.get("full_official_name"),
        row.get("population"),
        row.get("area"),
        row.get("postal_code"),
    )


def merge_neighborhood_row(raw: dict[str, Any], extra: dict[str, Any]) -> dict[str, Any]:
    nid = int(raw["kimlikNo"])
    return {
        "id": nid,
        "province_id": int(raw["il_id"]),
        "district_id": int(raw["ilce_id"]),
        "parent_registration_id": raw.get("koyKayitNo"),
        "municipality_type_code": raw.get("koyKurumBelediyeTur"),
        "neighborhood_type_code": raw.get("mahalleTur"),
        "name": raw.get("adi"),
        "full_official_name": raw.get("bilesenAdi"),
        "population": extra.get("population"),
    }


def merge_all_neighborhoods(
    data_new_root: Path,
    province_ids: list[int],
    pop_by_id: dict[int, dict[str, Any]],
) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for pid in province_ids:
        path = data_new_root / f"il-{pid}" / "mahalleler.jsonl"
        if not path.is_file():
            continue
        for raw in iter_jsonl(path):
            nid = int(raw["kimlikNo"])
            out.append(merge_neighborhood_row(raw, pop_by_id.get(nid, {})))
    return out


def neighborhood_row_to_sql_tuple(row: dict[str, Any]) -> tuple[Any, ...]:
    return (
        row["id"],
        row["province_id"],
        row["district_id"],
        row.get("parent_registration_id"),
        row.get("municipality_type_code"),
        row.get("neighborhood_type_code"),
        row.get("name"),
        row.get("full_official_name"),
        row.get("population"),
    )


def merge_street_row(raw: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": int(raw["kimlikNo"]),
        "province_id": int(raw["il_id"]),
        "district_id": int(raw["ilce_id"]),
        "neighborhood_id": int(raw["mahalle_id"]),
        "neighborhood_registration_no": raw.get("mahalleKayitNo"),
        "type_code": raw.get("turKod"),
        "name": raw.get("adi"),
        "full_official_name": raw.get("bilesenAdi"),
    }


def merge_streets_for_province(data_new_root: Path, province_id: int) -> list[dict[str, Any]]:
    path = data_new_root / f"il-{province_id}" / "sokaklar.jsonl"
    if not path.is_file():
        return []
    return [merge_street_row(raw) for raw in iter_jsonl(path)]


def street_row_to_sql_tuple(row: dict[str, Any]) -> tuple[Any, ...]:
    return (
        row["id"],
        row["province_id"],
        row["district_id"],
        row["neighborhood_id"],
        row.get("neighborhood_registration_no"),
        row.get("type_code"),
        row.get("name"),
        row.get("full_official_name"),
    )


def towns_from_more(more_towns_list: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "id": int(r["id"]),
            "province_id": int(r["provinceId"]),
            "district_id": int(r["districtId"]),
            "name": r.get("name"),
            "population": r.get("population"),
            "province_name": r.get("province"),
            "district_name": r.get("district"),
        }
        for r in more_towns_list
    ]


def villages_from_more(more_villages_list: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "id": int(r["id"]),
            "province_id": int(r["provinceId"]),
            "district_id": int(r["districtId"]),
            "name": r.get("name"),
            "population": r.get("population"),
            "province_name": r.get("province"),
            "district_name": r.get("district"),
        }
        for r in more_villages_list
    ]


def town_row_to_sql_tuple(row: dict[str, Any]) -> tuple[Any, ...]:
    return (
        row["id"],
        row["province_id"],
        row["district_id"],
        row.get("name"),
        row.get("population"),
        row.get("province_name"),
        row.get("district_name"),
    )


def village_row_to_sql_tuple(row: dict[str, Any]) -> tuple[Any, ...]:
    return town_row_to_sql_tuple(row)
