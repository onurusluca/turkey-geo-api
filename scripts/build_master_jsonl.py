#!/usr/bin/env python3
"""
Merge data-new + data-more into English-keyed JSONL (and a small meta.json).

Layout (default: data-formatted/jsonl/):
  meta.json
  provinces.jsonl
  province-{id}/districts.jsonl
  province-{id}/neighborhoods.jsonl
  province-{id}/streets.jsonl
  province-{id}/towns.jsonl      (only if that province has towns)
  province-{id}/villages.jsonl   (only if that province has villages)

Run from project root:
  python scripts/build_master_jsonl.py

Requires: Python 3.10+
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from geo_merge import (
    index_by_id,
    load_json_array,
    merge_all_districts,
    merge_all_neighborhoods,
    merge_all_provinces,
    merge_streets_for_province,
    province_ids_from_disk,
    towns_from_more,
    villages_from_more,
)


def dumps_jsonl_line(obj: dict[str, Any]) -> str:
    """One record per line; UTF-8 Turkish; stable key order."""
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(", ", ": "))


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(dumps_jsonl_line(row))
            f.write("\n")


def group_by_province(rows: list[dict[str, Any]]) -> dict[int, list[dict[str, Any]]]:
    by: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        by[int(row["province_id"])].append(row)
    return by


def main() -> int:
    parser = argparse.ArgumentParser(description="Build merged JSONL from data-new + data-more.")
    parser.add_argument("--data-new", type=Path, default=Path("data-new"))
    parser.add_argument("--data-more", type=Path, default=Path("data-more"))
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data") / "jsonl",
        help="Output directory for JSONL bundle",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Remove output directory before writing",
    )
    args = parser.parse_args()

    data_new = args.data_new.resolve()
    data_more = args.data_more.resolve()
    output: Path = args.output.resolve()

    if not data_new.is_dir():
        print(f"Missing data-new directory: {data_new}", file=sys.stderr)
        return 1
    if not data_more.is_dir():
        print(f"Missing data-more directory: {data_more}", file=sys.stderr)
        return 1

    provinces_path = data_more / "provinces.json"
    districts_path = data_more / "districts.json"
    neighborhoods_path = data_more / "neighborhoods.json"
    towns_path = data_more / "towns.json"
    villages_path = data_more / "villages.json"
    for p in (provinces_path, districts_path, neighborhoods_path, towns_path, villages_path):
        if not p.is_file():
            print(f"Missing required file: {p}", file=sys.stderr)
            return 1

    print("Loading data-more JSON...")
    more_provinces_list = load_json_array(provinces_path)
    more_districts_list = load_json_array(districts_path)
    more_neighborhoods_list = load_json_array(neighborhoods_path)
    more_towns_list = load_json_array(towns_path)
    more_villages_list = load_json_array(villages_path)

    more_provinces = index_by_id(more_provinces_list)
    more_districts = index_by_id(more_districts_list)
    more_neighborhoods_pop = index_by_id(more_neighborhoods_list)

    province_ids = province_ids_from_disk(data_new)
    provinces = merge_all_provinces(data_new, more_provinces)
    districts = merge_all_districts(data_new, province_ids, more_districts)
    neighborhoods = merge_all_neighborhoods(data_new, province_ids, more_neighborhoods_pop)
    towns = towns_from_more(more_towns_list)
    villages = villages_from_more(more_villages_list)

    if args.clean and output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True, exist_ok=True)

    districts_by_p = group_by_province(districts)
    neighborhoods_by_p = group_by_province(neighborhoods)
    towns_by_p = group_by_province(towns)
    villages_by_p = group_by_province(villages)

    meta: dict[str, Any] = {
        "built_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_data_new": str(data_new),
        "source_data_more": str(data_more),
        "layout": "Root: provinces.jsonl. Per province: province-{id}/districts.jsonl, neighborhoods.jsonl, streets.jsonl; towns.jsonl and villages.jsonl only when non-empty.",
        "counts": {
            "provinces": len(provinces),
            "districts": len(districts),
            "neighborhoods": len(neighborhoods),
            "towns": len(towns),
            "villages": len(villages),
            "streets_total": 0,
            "by_province": {},
        },
    }

    write_jsonl(output / "provinces.jsonl", provinces)
    print(f"provinces: {len(provinces)}")

    street_total = 0
    for pid in province_ids:
        base = output / f"province-{pid}"
        drows = districts_by_p.get(pid, [])
        nrows = neighborhoods_by_p.get(pid, [])
        write_jsonl(base / "districts.jsonl", drows)
        write_jsonl(base / "neighborhoods.jsonl", nrows)

        streets = merge_streets_for_province(data_new, pid)
        sn = len(streets)
        street_total += sn
        write_jsonl(base / "streets.jsonl", streets)

        trows = towns_by_p.get(pid, [])
        if trows:
            write_jsonl(base / "towns.jsonl", trows)

        vrows = villages_by_p.get(pid, [])
        if vrows:
            write_jsonl(base / "villages.jsonl", vrows)

        meta["counts"]["by_province"][str(pid)] = {
            "districts": len(drows),
            "neighborhoods": len(nrows),
            "streets": sn,
            "towns": len(trows),
            "villages": len(vrows),
        }

    meta["counts"]["streets_total"] = street_total
    print(f"districts: {len(districts)}")
    print(f"neighborhoods: {len(neighborhoods)}")
    print(f"towns: {len(towns)}")
    print(f"villages: {len(villages)}")
    print(f"streets: {street_total}")

    with (output / "meta.json").open("w", encoding="utf-8", newline="\n") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Done: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
