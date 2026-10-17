# ev-infra-map: Techfest IIT Bombay 2026-27, Challenge 1 (EV Infra Map India)
Team TM-72BD3802D52. This is the Phase 3 evidence notebook and the starting code for Round 2.

## Run it
```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
cd notebooks
../.venv/Scripts/python build_notebook.py
../.venv/Scripts/python -m jupyter nbconvert --to notebook --execute --inplace 01_eda_forecast.ipynb
```
`build_notebook.py` is the source of the notebook. Edit that file, then rebuild.

## Layout
| Path | What it holds |
|---|---|
| `data/raw/vahan/` | VAHAN 4 EV registrations, read 17 Oct 2026. See `README.md` in that folder for the exact query. |
| `data/raw/ocm-export/` | OpenChargeMap per-site export, India only (git sparse checkout, snapshot 22 Apr 2026) |
| `data/raw/osm_*.json` | Overpass extracts, 17 Oct 2026: chargers, district boundaries (admin_level 5), Bhubaneswar boundary, NH-16 |
| `data/raw/ind_ppp_2020_1km_Aggregated_UNadj.tif` | WorldPop 2020 population, 1 km grid |
| `data/raw/idp_vahan_fuel_*.csv` | IndiaDataPortal VAHAN mirror, 2019 to May 2024. Fallback only, not used in results. |
| `data/processed/` | RTO-to-district crosswalk, merged charger list, district GeoJSON |
| `outputs/` | `findings.md`, figures, tables, `data_quality_log.md` |

## Licences and attribution
| Source | Licence |
|---|---|
| VAHAN (MoRTH) | Government open data |
| OpenStreetMap | © OpenStreetMap contributors, ODbL |
| OpenChargeMap | Licence set by each data provider; see `referencedata.json` |
| WorldPop | CC BY 4.0 |

Assumed and imputed values are flagged in the data (`is_assumed`, `is_kw_imputed`, `is_points_imputed`) and listed in `outputs/tables/data_quality_log.md`.
