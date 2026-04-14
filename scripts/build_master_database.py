#!/usr/bin/env python3
"""
Merge data-new (registry + streets), data-more (population and enrichment),
into one SQLite database.

Run from project root:
  python scripts/build_master_database.py

Requires: Python 3.10+
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

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
    district_row_to_sql_tuple,
    neighborhood_row_to_sql_tuple,
    province_row_to_sql_tuple,
    street_row_to_sql_tuple,
    towns_from_more,
    town_row_to_sql_tuple,
    villages_from_more,
    village_row_to_sql_tuple,
)


def create_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS provinces (
          id INTEGER NOT NULL PRIMARY KEY,
          registration_no INTEGER,
          name TEXT NOT NULL,
          full_official_name TEXT,
          population INTEGER,
          area REAL,
          postal_code TEXT,
          altitude INTEGER,
          area_codes_json TEXT,
          is_coastal INTEGER,
          is_metropolitan INTEGER,
          nuts_json TEXT,
          latitude REAL,
          longitude REAL,
          maps_json TEXT,
          region_json TEXT
        );

        CREATE TABLE IF NOT EXISTS districts (
          id INTEGER NOT NULL PRIMARY KEY,
          province_id INTEGER NOT NULL,
          registration_no INTEGER,
          name TEXT NOT NULL,
          full_official_name TEXT,
          population INTEGER,
          area REAL,
          postal_code TEXT,
          FOREIGN KEY (province_id) REFERENCES provinces(id)
        );
        CREATE INDEX IF NOT EXISTS idx_districts_province ON districts(province_id);

        CREATE TABLE IF NOT EXISTS neighborhoods (
          id INTEGER NOT NULL PRIMARY KEY,
          province_id INTEGER NOT NULL,
          district_id INTEGER NOT NULL,
          parent_registration_id INTEGER,
          municipality_type_code INTEGER,
          neighborhood_type_code INTEGER,
          name TEXT,
          full_official_name TEXT,
          population INTEGER,
          FOREIGN KEY (province_id) REFERENCES provinces(id),
          FOREIGN KEY (district_id) REFERENCES districts(id)
        );
        CREATE INDEX IF NOT EXISTS idx_neighborhoods_province ON neighborhoods(province_id);
        CREATE INDEX IF NOT EXISTS idx_neighborhoods_district ON neighborhoods(district_id);

        CREATE TABLE IF NOT EXISTS streets (
          id INTEGER NOT NULL PRIMARY KEY,
          province_id INTEGER NOT NULL,
          district_id INTEGER NOT NULL,
          neighborhood_id INTEGER NOT NULL,
          neighborhood_registration_no INTEGER,
          type_code INTEGER,
          name TEXT,
          full_official_name TEXT,
          FOREIGN KEY (province_id) REFERENCES provinces(id),
          FOREIGN KEY (district_id) REFERENCES districts(id),
          FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id)
        );
        CREATE INDEX IF NOT EXISTS idx_streets_neighborhood ON streets(neighborhood_id);
        CREATE INDEX IF NOT EXISTS idx_streets_province ON streets(province_id);

        CREATE TABLE IF NOT EXISTS towns (
          id INTEGER NOT NULL PRIMARY KEY,
          province_id INTEGER NOT NULL,
          district_id INTEGER NOT NULL,
          name TEXT,
          population INTEGER,
          province_name TEXT,
          district_name TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_towns_province ON towns(province_id);

        CREATE TABLE IF NOT EXISTS villages (
          id INTEGER NOT NULL PRIMARY KEY,
          province_id INTEGER NOT NULL,
          district_id INTEGER NOT NULL,
          name TEXT,
          population INTEGER,
          province_name TEXT,
          district_name TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_villages_province ON villages(province_id);
        """
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Build merged SQLite DB from data-new + data-more.")
    parser.add_argument(
        "--data-new",
        type=Path,
        default=Path("data-new"),
        help="Path to data-new directory",
    )
    parser.add_argument(
        "--data-more",
        type=Path,
        default=Path("data-more"),
        help="Path to data-more directory",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data") / "master.sqlite",
        help="Output SQLite file path",
    )
    args = parser.parse_args()

    data_new: Path = args.data_new.resolve()
    data_more: Path = args.data_more.resolve()
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

    print("Loading data-more JSON (this may take a moment)...")
    more_provinces_list = load_json_array(provinces_path)
    more_districts_list = load_json_array(districts_path)
    more_neighborhoods_list = load_json_array(neighborhoods_path)
    more_towns_list = load_json_array(towns_path)
    more_villages_list = load_json_array(villages_path)

    more_provinces = index_by_id(more_provinces_list)
    more_districts = index_by_id(more_districts_list)
    more_neighborhoods_pop = index_by_id(more_neighborhoods_list)

    province_ids = province_ids_from_disk(data_new)
    prov_rows = [province_row_to_sql_tuple(r) for r in merge_all_provinces(data_new, more_provinces)]
    district_rows = [district_row_to_sql_tuple(r) for r in merge_all_districts(data_new, province_ids, more_districts)]
    neighborhood_rows = [
        neighborhood_row_to_sql_tuple(r)
        for r in merge_all_neighborhoods(data_new, province_ids, more_neighborhoods_pop)
    ]
    street_rows = [
        street_row_to_sql_tuple(r)
        for pid in province_ids
        for r in merge_streets_for_province(data_new, pid)
    ]
    town_rows = [town_row_to_sql_tuple(r) for r in towns_from_more(more_towns_list)]
    village_rows = [village_row_to_sql_tuple(r) for r in villages_from_more(more_villages_list)]

    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()

    conn = sqlite3.connect(output)
    try:
        create_schema(conn)

        conn.executemany(
            """
            INSERT INTO provinces (
              id, registration_no, name, full_official_name,
              population, area, postal_code, altitude, area_codes_json,
              is_coastal, is_metropolitan, nuts_json, latitude, longitude,
              maps_json, region_json
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            prov_rows,
        )
        print(f"provinces: {len(prov_rows)}")

        conn.executemany(
            """
            INSERT INTO districts (
              id, province_id, registration_no, name, full_official_name,
              population, area, postal_code
            ) VALUES (?,?,?,?,?,?,?,?)
            """,
            district_rows,
        )
        print(f"districts: {len(district_rows)}")

        conn.executemany(
            """
            INSERT INTO neighborhoods (
              id, province_id, district_id, parent_registration_id,
              municipality_type_code, neighborhood_type_code,
              name, full_official_name, population
            ) VALUES (?,?,?,?,?,?,?,?,?)
            """,
            neighborhood_rows,
        )
        print(f"neighborhoods: {len(neighborhood_rows)}")

        conn.executemany(
            """
            INSERT INTO streets (
              id, province_id, district_id, neighborhood_id,
              neighborhood_registration_no, type_code, name, full_official_name
            ) VALUES (?,?,?,?,?,?,?,?)
            """,
            street_rows,
        )
        print(f"streets: {len(street_rows)}")

        conn.executemany(
            """
            INSERT INTO towns (
              id, province_id, district_id, name, population, province_name, district_name
            ) VALUES (?,?,?,?,?,?,?)
            """,
            town_rows,
        )
        conn.executemany(
            """
            INSERT INTO villages (
              id, province_id, district_id, name, population, province_name, district_name
            ) VALUES (?,?,?,?,?,?,?)
            """,
            village_rows,
        )
        print(f"towns: {len(town_rows)}")
        print(f"villages: {len(village_rows)}")

        now = datetime.now(timezone.utc).isoformat()
        conn.executemany(
            "INSERT INTO meta (key, value) VALUES (?, ?)",
            [
                ("built_at_utc", now),
                ("source_data_new", str(data_new)),
                ("source_data_more", str(data_more)),
            ],
        )

        conn.commit()
        conn.execute("ANALYZE")
    finally:
        conn.close()

    print(f"Done: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
