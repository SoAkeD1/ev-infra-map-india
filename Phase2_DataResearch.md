# Phase 2 — Data Research, Access Check, Benchmarks & USP
**EV Infra Map India (C1) · Team TM-72BD3802D52 · Techfest IIT Bombay 2026-27 · 17 Oct 2026**

> Builds on [Phase1_Scope.md](Phase1_Scope.md) (pilot: Odisha + Karnataka; base FY 2025-26; forecast FY 2029-30).
> ⚠ = unconfirmed figure or assumption. Numbers in [brackets] refer to the Sources list at the end.

---

## A. Data inventory

| # | Layer | **Best source** | Fallback | Level | Format / access | Update | Licence | Known issues |
|---|---|---|---|---|---|---|---|---|
| 1 | EV registrations | **VAHAN 4 dashboard** (MoRTH) [1] | IndiaDataPortal / Dataful VAHAN mirrors [2][3] | State → **RTO** × vehicle class × fuel × month/FY | Web report → Excel export | Daily | Govt open data (GODL) ⚠ | Cumulative registrations (no scrappage deduction); 2 electric fuel codes (sum both ⚠); RTO ≠ district |
| 2 | RTO → district crosswalk | **Self-built** from state transport RTO jurisdiction lists + LGD codes [4] | Insurer/aggregator RTO lists (Parkplus, Acko) [5] | RTO | Manual table (CSV) | Rare | — | Odisha OD-31…35 codes conflict across sources [5]; sub-RTOs (e.g. Barbil) |
| 3 | Public chargers | **Merged: OCM API + OSM + operator locators**, checked against **MHI Parliament annexures** [6][7][8][9] | EV Yatra app (manual spot-check) [10]; MapmyIndia (18k+ chargers, commercial) [11] | **Point** (lat/lon, connectors, kW) | API (OCM), Overpass (OSM), PDF tables (MHI) | OCM/OSM continuous; MHI per session | OCM: CC BY 4.0 ⚠; OSM: ODbL | Thin OCM India coverage [8]; no national AC/DC split ("not maintained" — MHI) [9]; stations vs points |
| 4 | Battery swap | **Operator locators** (Battery Smart, Sun Mobility) | Network totals ÷ city (synthetic) [12][13] | Point / city | Scrape-by-hand / press releases | Ad hoc | Proprietary | No open dataset; capacity not published |
| 5 | District boundaries | **Survey of India Online Maps** (official) [14] | **DataMeet** districts (ECI-derived) [15]; GADM 4.1 | District polygon | Shapefile/GeoJSON | Ad hoc | SoI: free with registration ⚠; DataMeet: CC BY ⚠; GADM: non-commercial | No LGD code in polygons → name-join with LGD CSV [4][15]; check Karnataka = 31 districts (Vijayanagara, 2020) |
| 6 | Roads / NH | **OSM** (`highway=motorway/trunk/primary`, `ref~"NH"`) via Geofabrik [16] | NHAI toll-plaza list with coordinates (Dataful) [17] | Line | PBF/Shapefile | Daily | ODbL | NH GIS (BISAG-N, ~1.3 lakh km) not public [18] |
| 7 | Population & urbanisation | **WorldPop 100 m** (2020) + **GHSL GHS-POP/SMOD** (2025 epoch) [19][20] | Census 2011 district totals + MoHFW projections to 2036 [21] | 100 m raster → H3 | GeoTIFF | Annual / 5-yr | CC BY 4.0 | Census 2027 not available yet ⚠ |
| 8 | Economic proxy | **VIIRS annual night-lights** (EOG) [22] | State DES district GDP (GDDP) [23] | 500 m raster | GeoTIFF | Annual | CC BY 4.0 | Gas flares/industrial glare (Odisha mining belt) — mask |
| 9 | Grid (substations) | **OSM `power=substation`** [16] | OPTCL / KPTCL substation lists (PDF) [24] | Point | Overpass | Continuous | ODbL | Incomplete at 33/11 kV; no capacity/headroom → proxy only |
| 10 | Context | Toll-plaza traffic (PCU/day) as AADT proxy [17][25]; OSM POIs (fuel stations, malls, hospitals, bus/rail stations); ESA WorldCover land use [26]; state tourism lists | MoT India Tourism Statistics; PM Gati Shakti (restricted) | Point / raster | CSV / GeoTIFF | Annual | Mixed | No public AADT [25]; toll data unofficial scrape |

---

## B. Access check

| Source | Steps to get a sample | Blockers | Rating | Check by hand / fallback |
|---|---|---|---|---|
| **VAHAN dashboard** | vahan.parivahan.gov.in/vahan4dashboard → *Reports* → set **State = Odisha**, **RTO = one office**, **Y-axis = Vehicle Class**, **X-axis = Financial Year** → left panel: tick fuel **ELECTRIC(BOV) + PURE EV** ⚠ → *Refresh* → Excel icon | One state × RTO × year per export (~35 Odisha + ~70 Karnataka RTOs × 7 FY ≈ 700 exports); slow JSF page; session timeouts | **Manual** | Fuel-code names; whether "All RTOs" + Y-axis = RTO is allowed (would cut the work ~10×). Fallback: Dataful/IndiaDataPortal monthly RTO files [2][3] |
| RTO crosswalk | Odisha/Karnataka transport dept "Offices" pages → list RTO, jurisdiction → map to LGD district code | Not published as a table | **Manual** | Resolve OD-31…35 [5]; RTOs covering 2 districts → split by population share (documented) |
| **OCM** | Register free key → `api.openchargemap.io/v3/poi?countrycode=IN&maxresults=10000&compact=true&key=…` | API key; default returns only 100 rows [8] | **Easy** | Record count vs MHI totals; DataQuality score per POI |
| **OSM chargers** | overpass-turbo.eu: `area["ISO3166-2"="IN-OR"]; nwr["amenity"="charging_station"](area); out center;` (repeat `IN-KA`) | None | **Easy** | Tag completeness (`capacity`, `socket:*`, `operator`) |
| **MHI / Parliament tables** | sansad.in → Rajya/Lok Sabha Q&A search "charging stations" → annexure PDF → extract with tabula/camelot | PIB pages return 403 to scripts; PDFs | **Manual** | Definition per table (OMC-only vs all) — see C1 |
| Operator locators (Tata Power EZ, Statiq, ChargeZone, Jio-bp, IOCL/BPCL/HPCL, Bolt.Earth) | Open locator map → filter by city → copy | Apps/JS maps; ToS may forbid scraping | **Hard** | Use only for **sample validation** (e.g. 50 sites/state), not bulk |
| EV Yatra (BEE) | App/web map only | No download/API found [10] | **Hard** | Spot-check presence of our merged sites |
| Swap stations | Operator websites/app maps | No data; ToS | **Hard** | **Synthetic**: city station counts from press × swaps/day parameter (labelled) |
| SoI district boundaries | onlinemaps.surveyofindia.gov.in → register → Administrative boundary → district | Registration; terms ⚠ | **Manual** | Fallback DataMeet/GADM; validate 30 (OD) + 31 (KA) polygons |
| OSM roads/substations | download.geofabrik.de → Asia → India → *eastern-zone* (Odisha) / *southern-zone* (Karnataka) `.osm.pbf` → osmium/pyrosm | None | **Easy** | NH `ref` tag coverage; substation completeness vs OPTCL/KPTCL list |
| WorldPop / GHSL / VIIRS / WorldCover | hub.worldpop.org → IND 2020 constrained 100 m; ghsl.jrc.ec.europa.eu → GHS-POP, GHS-SMOD; eogdata.mines.edu → VNL v2 annual; esa-worldcover.org | Large rasters | **Easy** | Clip to state before H3 aggregation |
| Toll traffic | Dataful toll list [17]; GitHub NHAI TIS scrape (PCU/day, 468 plazas) [25] | Unofficial, partly old | **Manual** | Use as relative corridor weight only; AADT via RTI to NHAI if needed |
| GDDP | Odisha / Karnataka DES Economic Survey annex tables | PDF, lagged 2–3 yrs | **Manual** | Night-lights as primary proxy |

---

## C. Resolving Phase 1 flags

### C1. Public charger count — why sources disagree

| Source | Odisha | Karnataka | National | What it actually counts |
|---|---|---|---|---|
| MHI reply, 27 Mar 2026 (Mercom) [6] | ⚠ n/a | 2,400 | **27,737** installed / 22,753 working | **OMC stations only** (IOCL/BPCL/HPCL, FY21–26) — *not* the national total |
| MHI Dec 2025 table (via third party) [27] | **606** | — | 29,151 | Public stations (definition unclear) ⚠ |
| MHI, Rajya Sabha unstarred Q, 7 Aug 2026 (as of 29 Jul 2026) [9] | ⚠ not reported in article | **6,805** (#2) | **52,718** | All installed EVCS; "fast/slow split not maintained" |
| BEE, Aug 2024 [28] | — | 5,765 (≈85% in Bengaluru Urban) | — | Public stations; 5,479 private, 195 BESCOM |
| ZeeBiz/MHI, Feb 2026 [29] | 198 | — | 12,146 *operational* | Operational subset (likely FAME/PM E-DRIVE only) ⚠ |
| Odisha state, ~2025 [30] | ~550 | — | — | Includes **captive** OEM/DISCOM/OMC chargers |
| CII report, Aug 2026 [31] | — | — | 67,657 chargers | **Charge points**, not stations |

**Why they differ:** (1) **scope** (OMC-only vs all CPOs); (2) **stations vs charge points** (one station = 1–20+ points); (3) **installed vs operational** (≈18% gap in OMC data [6]); (4) **public vs captive**; (5) **date** (count nearly doubled Mar→Jul 2026).

**Recommendation: build ONE deduplicated count.**
1. Pull points from OCM + OSM + operator sample → one schema: `id, source, operator, lat, lon, n_points, max_kW, connector, access, status, last_seen`.
2. Remove duplicates: same operator within **50 m**, or any operator within **15 m** with matching kW/connector → one site; keep the record with the most fields; save every link in a `source_ids` field.
3. Classify each site as **light (<30 kW)** or **DC (≥30 kW)**. If kW is missing: OMC/highway sites → DC; LEV/2W operators → light (flagged as imputed).
4. Filter out `access=private` and captive OEM sites.
5. **Reconcile** state totals against the latest MHI annexure. The gap (our count vs official) becomes the **coverage-completeness ratio**, which we report and use to scale counts in the High-supply scenario.
6. Report two numbers: **sites** and **charge points**. The gap index uses **points/kW**.

### C2. MoP charging guidelines — latest = **17 Sep 2024** (supersedes 2018/2019/2022)

| Norm | 2019/2022 (old) | **2024 (current)** |
|---|---|---|
| Urban grid | 1 PCS per 3 km × 3 km | **≥1 PCS per 1 km × 1 km by FY 2030** (state-notified urban areas) |
| Highways / major roads | Every 25 km, both sides | **Every 20 km, both sides** |
| Long-range / heavy-duty | Fast charger every 100 km | **Fast charger every 100 km, each side** (designated corridors) |
| Licence | Delicensed | Delicensed (anyone may set up) |

Source: MoP "Guidelines and Standards for EVCI", 17 Sep 2024 [32][33][34]. ⚠ Figures come from news coverage and the ORF citation; open the PDF on powermin.gov.in to quote clause numbers.
**→ Phase 1 update:** use 1 km and 20 km norms. Switch **urban** cells to **H3 res 8 (~0.74 km²)** so the cell matches the 1 km² norm; keep res 7 for rural areas.

### C3. Odisha EV Policy 2.0 — **DRAFT, not notified**
- Draft *Odisha EV Policy 2025* published Sep 2025; comments closed **8 Oct 2025** [35][36].
- Draft targets: **50% of new registrations EV by 2030** (ThePrint [37]); an earlier announcement said 2036 [38] ⚠ (conflict).
- In force: **EV Policy 2021, extended to 31 Dec 2026** (notification of ~3–4 Oct 2026) [39].
- → Use the 2030 target only as the **High scenario** for Odisha, labelled "draft policy".

### C4. VAHAN completeness
- **Odisha and Karnataka are both on central VAHAN 4.** Both appear in MoRTH's monthly state tables (PIB, Feb 2024) [40].
- **Telangana** was the gap state; it migrated on 15 Mar 2026 and back-filled data by May 2026 [41]. This matters for national scale-up only.
- ⚠ No source confirms **every RTO** is on VAHAN 4. Check by hand: compare the RTO dropdown with each state's official RTO list.
- Known VAHAN data problems (DTE analysis [42]): cumulative registrations count vehicles that may no longer be on the road, and the fuel/class coding is inconsistent.

---

## D. Benchmarks & planning parameters

| Parameter | Base value | Range | Source | Confidence |
|---|---|---|---|---|
| **Public share of charging energy — 2W** | 10% | 5–20% | Home = 80–90% of EV energy [43]; >90% of Delhi e-2W charge at home [44] | Medium |
| — 3W e-auto / L5 | 30% ⚠ | 15–50% | No Indian data; fleets use public/swap [43] | **Low** |
| — 3W e-rickshaw (L3) | 0–5% ⚠ | 0–10% | Home/depot charging [43] | **Low** |
| — 4W | 20% ⚠ | 10–35% | 4W = 67% of public energy (Bolt.Earth) [45]; home charging meets daily need [44] | Low–Med |
| **Daily km — 2W** | 25 | 19–33 (<50) | Ather fleet data [46]; CSTEP [47] | Medium |
| — 3W e-auto | 100 | 80–150 | WRI India [48] | Medium |
| — e-rickshaw | 70 ⚠ | 50–100 | Short trips (<10 km each) [49] | Low |
| — 4W | 35 ⚠ | 25–46 | No survey found; LocalCircles illustration [50] | **Low** |
| **Energy use** (Wh/km) | 2W 33 · 3W 59–61 · e-rick 77 · 4W 123 city / 165 highway | 4W small: 84 | LBNL [51]; WRI (17 / 13 km/kWh) [48] | Medium |
| → **Daily energy per vehicle** (kWh) | 2W 0.8 · e-auto 6.0 · e-rick 5.4 · 4W 4.3 | ±30% | = km × Wh/km | Derived |
| **Charger utilisation** — current India | 1–5% | <25% | Rubix/IANS [31]; Bolt.Earth [52] | Medium |
| — **planning target** | AC 6 h/day (25%) · DC 4 h/day (17%) ⚠ | 2–8 h | Assumption: viable but not congested; sensitivity tested | Assumption |
| **Charge-point power** | AC 3.3 / 7.4 / 22 kW · LEV DC 12–15 kW · DC 30 / 60 / 120 kW | — | BIS/MoP standards; 73% of chargers <30 kW [31] | High |
| **Swap station capacity** | 90 swaps/day ⚠ | 80–100 | Battery Smart ≈100k/day ÷ ~1,100 stations; Sun Mobility ~100/day [12][13] | Medium |
| — energy per swap | 2 kWh ⚠ | 1.5–3 | Assumption (2W/3W packs) | Low |
| **EVs per public charger** — India | To compute: national VAHAN EV stock ÷ 52,718 stations ⚠ | — | [9] + VAHAN | Phase 3 |
| — Karnataka | ~130 EVs/station | — | ~8.9 lakh EVs [Ph1] ÷ 6,805 [9] | Medium |
| — Odisha | ~360 EVs/station ⚠ | 300–400 | ~2.19 lakh ÷ 606 (different dates) | Low–Med |
| — China / EU / US / Norway | **10 / 11–14 / 33 / ~35** electric LDVs per public point | — | IEA GEVO 2026 [53][54] | High (LDV only) |
| — EU AFIR rule | **1.3 kW public power per BEV**; LDV charging pool every **60 km** on TEN-T core | — | AFIR (EU 2023/1804) [55][56] | High |
| **EV fleet attrition** | 4W 0%; 2W 2%/yr; e-rickshaw 10%/yr ⚠ | — | No Indian EV data; fleet is young; e-rickshaw life ~5–7 yrs ⚠ | **Low** |

**How to read the ratios:**
- International ratios cover cars only and count **charge points**. India's figures include 2W/3W and count **stations**, so never compare them directly.
- For the cross-country comparison, use **kW per BEV** (as in AFIR).

**No Indian data, so a defensible assumption is used:**
- **Public-charging share for 3W and 4W:** run Low/Base/High scenarios and show results are robust (rank stability of the top-10 districts).
- **4W daily km:** take a value from the 2W:4W usage ratio in Ather/IRADe data and test sensitivity to ±30%.
- **Attrition:** survival curves using the **vehicle scrappage policy** fitness-test ages (15 yrs commercial / 20 yrs private) ⚠. EV attrition is negligible before 2030 except for e-rickshaws.

---

## E. Existing platforms & USP

| Platform / study | What it does | What it lacks |
|---|---|---|
| **EV Yatra** (BEE) [10] | National locator app; operators self-register; live slots and tariff | No open data or API; no VAHAN link; no gap index, forecast or siting |
| **MHI / Parliament tables** [6][9] | Official state counts | Inconsistent definitions; no coordinates; no AC/DC split |
| **PlugShare / OCM** [8] | Crowdsourced global map + API | Thin India coverage; no demand side |
| **Operator apps** (Tata Power EZ, Statiq, Jio-bp, Bolt.Earth); **MapmyIndia** (18k+) [11] | Find & pay | Each covers only its own network; commercial; no planning view |
| **Delhi Open EV portal** [57] | Open charger + swap database with API | Delhi only; API key needed |
| **CSTEP — Bengaluru 2030** [58] | City charger demand, grid impact, locations | One city; static report; no tool |
| **ICCT — e-truck charging study** [59] | National truck charging demand (9 GW by 2030) | Trucks only |
| **FICCI / CII 2030 estimates** [31][60] | National capex / charger totals (1.32 M points) | National total only; no district or corridor detail |
| **Academic** — Delhi set-cover (Current Science 2022), Mumbai GIS-TOPSIS [61] | City-level optimisation | Single city; no VAHAN-based demand; not reproducible |
| **MoP guidelines 2024 / NITI handbook** [32] | Norms | No measurement of compliance |

**USP (2–3 lines):**
> **The first open, reproducible pipeline that links VAHAN EV registrations (RTO → district, by segment) to a deduplicated, geolocated census of public chargers.** It converts segment-wise energy demand into **light vs DC charger needs to 2030 under three scenarios**, measures **compliance with MoP 2024 norms** (1 km urban grid, 20 km highway spacing), and recommends **grid-aware sites** (substation proximity) for districts and NH corridors. Every number is traceable to a source or a labelled assumption.

---

## ★ DATA STRATEGY (paste-ready, ≤1 page)

**Sources**

| Layer | Primary source | Fallback | Granularity | Licence |
|---|---|---|---|---|
| EV registrations | VAHAN 4 dashboard (MoRTH), FY20–FY26 | IndiaDataPortal / Dataful VAHAN mirrors | RTO × class × fuel × FY | GODL |
| RTO → district | Built by team (state transport RTO lists + LGD codes) | Public RTO code lists | RTO | — |
| Public chargers | OpenChargeMap API + OpenStreetMap, reconciled with MHI Parliament annexures (Jul 2026: 52,718 national) | Operator locators (sample), EV Yatra spot-check | Point (kW, connectors) | CC BY 4.0 / ODbL |
| Battery swap | Operator networks (Battery Smart, Sun Mobility) | **Synthetic** city allocation (labelled) | Point / city | — |
| Boundaries | Survey of India + LGD codes | DataMeet / GADM | District | Govt / CC BY |
| Roads & NH | OpenStreetMap (Geofabrik) | NHAI toll-plaza list | Line | ODbL |
| Population / urban | WorldPop 100 m, GHSL GHS-POP/SMOD | Census 2011 + MoHFW projections | 100 m → H3 | CC BY 4.0 |
| Economic activity | VIIRS night-lights (EOG) | State GDDP | 500 m | CC BY 4.0 |
| Grid | OSM substations | OPTCL / KPTCL lists | Point | ODbL |
| Context | Toll traffic (PCU/day), OSM POIs, ESA WorldCover, tourism lists | — | Point / raster | Mixed |
| Norms | MoP EVCI Guidelines, 17 Sep 2024 | — | — | Govt |

**Integration approach**
- **One spatial key.** Every layer is joined to **H3 cells** (res 8 urban / res 7 rural), and each cell is tied to an **LGD district code**. Districts and NH segments are built by adding up cells.
- **Demand side.** VAHAN RTO counts are mapped to districts via the crosswalk. Within each district, counts are spread to cells by population × night-lights weight. Segments are combined using **km × Wh/km × public-charging share**.
- **Supply side.** Merge OCM + OSM + operator samples into one schema. Deduplicate by distance (≤15–50 m) and attributes. Classify as light (<30 kW) or DC (≥30 kW), and record a **completeness ratio** against official MHI counts.
- **Quality checks.** Each record gets a source, date and confidence flag. District totals are checked against official tables. Every imputed value (kW class, RTO split, swap capacity) is flagged.
- **Reproducibility.** One Python pipeline (`geopandas`, `h3`, `pyrosm`, `rasterio`) on GitHub; the raw-data snapshot date is fixed for all results.

**Synthetic data note:** Synthetic or modelled values are limited to (i) swap-station capacity and locations not published by operators, (ii) sub-district (cell-level) allocation of EVs, and (iii) planning parameters with no Indian data (public-charging share for 3W/4W, 4W daily km). Each is labelled `synthetic` or `assumed` in the data and stress-tested in Low/Base/High scenarios.

---

## Sources
1. [VAHAN 4 Dashboard — MoRTH](https://vahan.parivahan.gov.in/vahan4dashboard/)
2. [IndiaDataPortal — VAHAN Vehicle Registrations](https://ckandev.indiadataportal.com/dataset/vahan-vehicle-registrations/resource/808d2b3c-dcdd-48fc-ae6a-cc99e137ec9c)
3. [Dataful — VAHAN RTO/maker/class datasets](https://dataful.in/datasets/22379)
4. [Local Government Directory (LGD)](https://lgdirectory.gov.in/)
5. [Parkplus — Odisha RTO codes](https://parkplus.io/rto/odisha) · [Zurich Kotak — Odisha RTO](https://www.zurichkotak.com/knowledge-center/rto/odisha) · [Acko — Talcher OD-35](https://www.acko.com/rto/odisha/talcher/)
6. [Mercom — Oil firms install 27,737 EV chargers FY21–FY26](https://mercomindia.com/oil-firms-install-27737-ev-chargers-between-fy-2021-fy-2026) · [PIB/MHI — Status and Expansion of EV Charging Infrastructure, 27 Mar 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2246042&reg=3&lang=1)
7. [OpenStreetMap — amenity=charging_station](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dcharging_station)
8. [Open Charge Map — API data for India (forum)](https://community.openchargemap.org/t/api-hit-to-get-data-for-india/882)
9. [Electrical Mirror — Karnataka 6,805 stations; Rajya Sabha reply 7 Aug 2026](https://electricalmirror.net/karnataka-ranks-second-in-india-with-6805-ev-charging-stations/)
10. [Powerline — EV Yatra portal & app launched](https://powerline.net.in/2022/12/14/ev-yatra-web-portal-and-mobile-app-launched/)
11. [Autocar Pro — Bolt.Earth × MapmyIndia](https://www.autocarpro.in/news/boltearth-partners-with-mapmyindia-to-boost-ev-charger-discovery-133216)
12. [Autocar Pro — Battery Smart 1 lakh daily swaps](https://autocarpro.in/news/battery-smart-achieves-1-lakh-daily-swaps-on-its-ev-battery-swapping-network-121925)
13. [Swarajya — Sun Mobility 100 swap stations at Bengaluru metro](https://swarajyamag.com/amp/story/news-brief/integrating-ev-infra-with-public-transport-sun-mobility-to-set-up-100-battery-swapping-stations-across-bengaluru-metro-stations)
14. [Survey of India — Online Maps Portal](https://onlinemaps.surveyofindia.gov.in/)
15. [DataMeet — India district boundaries](https://projects.datameet.org/maps/districts/)
16. [Geofabrik — India OSM extracts](https://download.geofabrik.de/asia/india.html)
17. [Dataful — NHAI toll plazas](https://dataful.in/datasets/21597/)
18. [Indian Infrastructure — GIS mapping of NH network](https://indianinfrastructure.com/2024/05/14/government-to-complete-gis-mapping-of-entire-nh-network/)
19. [WorldPop — India population](https://hub.worldpop.org/geodata/listing?id=79)
20. [GHSL — JRC Global Human Settlement Layer](https://ghsl.jrc.ec.europa.eu/download.php)
21. [Census of India](https://censusindia.gov.in/) · [MoHFW — Population Projections 2011–2036](https://main.mohfw.gov.in/sites/default/files/Population%20Projection%20Report%202011-2036%20-%20upload_compressed_0.pdf)
22. [EOG — VIIRS Nighttime Lights](https://eogdata.mines.edu/products/vnl/)
23. [Odisha Directorate of Economics & Statistics](https://desorissa.nic.in/) · [Karnataka DES](https://des.karnataka.gov.in/)
24. [OPTCL](https://www.optcl.co.in/) · [KPTCL](https://kptcl.karnataka.gov.in/)
25. [GitHub — toll-plazas-india (NHAI TIS scrape)](https://github.com/ajitccdc/toll-plazas-india) · [MATEC 2024 — AADT from NHAI counts](https://www.matec-conferences.org/articles/matecconf/pdf/2024/12/matecconf_spice24_03008.pdf)
26. [ESA WorldCover 10 m](https://esa-worldcover.org/)
27. [India Data Report — state-wise EV charging stations (MHI Dec 2025 table)](https://indiadatareport.com/state-wise-ev-charging-stations-india/)
28. [GKToday — Karnataka 5,765 stations (BEE)](https://www.gktoday.in/karnataka-leads-nation-with-5765-public-ev-charging-stations/) · [Deccan Herald — BEE Karnataka](https://www.deccanherald.com/amp/story/india%2Fkarnataka%2Fkarnataka-has-highest-number-of-ev-charging-stations-in-country-bureau-of-energy-efficiency-3156270)
29. [Zee Business — 12,146 operational PCS (MHI)](https://www.zeebiz.com/automobile/electric-vehicles/news-12146-public-ev-charging-stations-operational-across-the-country-ministry-of-heavy-industries-275500)
30. [BioEnergy Times — Odisha EV charging / PM E-DRIVE](https://bioenergytimes.com/odisha-gets-rs-40-50-crore-under-pm-e-drive-scheme-for-ev-charging-network/)
31. [IANS — India needs 1.32 M charging points by 2030](https://ianslive.in/india-needs-132-million-ev-charging-points-by-2030-in-massive-opportunity-report--20260902113012)
32. [Business Standard — Govt issues revised EV charging guidelines (Sep 2024)](https://www.business-standard.com/industry/auto/govt-issues-revised-guidelines-for-electric-vehicle-charging-stations-124091900970_1.html)
33. [Energetica India — MoP updates EVCI guidelines 2024](https://www.energetica-india.net/news/ministry-of-power-updates-guidelines-for-installing-ev-charging-infra-2024)
34. [ORF — Charging infrastructure: the missing link (cites MoP 17-09-2024)](https://www.orfonline.org/research/charging-infrastructure-the-missing-link-in-india-s-evs-transition)
35. [Odisha C&T Dept — Draft Odisha EV Policy 2025 (PDF)](https://ct.odisha.gov.in/sites/default/files/2025-09/Draft-Odisha%20EV%20Policy,2025.pdf)
36. [Organiser — Odisha draft EV Policy 2025](https://organiser.org/2025/09/10/315138/bharat/odisha-state-govt-releases-draft-electric-vehicle-policy-2025-incentives-up-to-rs-20-lakh-proposed/)
37. [ThePrint — Odisha drafts EV policy, 50% by 2030](https://theprint.in/india/odisha-govt-drafts-new-ev-policy-targeting-50-per-cent-adoption-by-2030/2740178/)
38. [The Week — Odisha EV Policy 2.0, 50% by 2036](https://www.theweek.in/wire-updates/business/2025/06/25/ces27-od-ev-policy.html)
39. [OMMCOM News — EV Policy 2021 extended to 31 Dec 2026](https://ommcomnews.com/odisha-news/odisha-extends-electric-vehicle-policy-till-december-31-2026/) · [The Hans India](https://www.thehansindia.com/odisha/odisha-extends-ev-policy-validity-till-dec-31-1128872)
40. [PIB — MoRTH state-wise registration tables (Feb 2024)](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2024/feb/doc202429309901.pdf)
41. [EV India Online — Telangana VAHAN integration](https://evindia.online/news/telangana-vahan-integration-ev-sales-data-recovered)
42. [Down To Earth — Driving on broken data: VAHAN's cracks](https://www.downtoearth.org.in/air/driving-on-broken-data-why-indias-clean-air-and-ev-push-cannot-outrun-vahans-cracks)
43. [EVreporter — Kazam & AEEE residential charging report](https://evreporter.com/kazam-and-aeee-launch-report-on-residential-ev-charging-in-india/)
44. [IRADe — Delhi EV survey & grid impact](https://irade.org/wp-content/uploads/2025/08/IRN-DelhiEVsurveyImpactonGridPaper-1.pdf)
45. [Autocar Pro — Bolt.Earth: 2W 78% sessions, PVs 67% energy](https://www.autocarpro.in/news/2w-drive-78-percent-of-ev-charging-sessions-pvs-draw-67-percent-power-boltearth-134608)
46. [Autocar Pro — Ather users' km in 2024](https://autocarpro.in/news/ather-reports-239-billion-kilometres-covered-by-its-ev-users-in-2024-124671)
47. [CSTEP — Workplace charging](https://cstep.in/?p=2473)
48. [WRI India — Why electric three-wheelers make business sense](https://wri-india.org/blog/busting-cost-barrier-why-electric-three-wheelers-make-business-sense)
49. [SAE 2019-28-2486 — Real-world energy efficiency of e-rickshaws](https://saemobilus.sae.org/content/2019-28-2486/)
50. [Business Today — LocalCircles EV survey](https://www.businesstoday.in/auto/story/just-5-per-cent-may-want-to-buy-electric-cars-this-year-most-want-evs-under-rs-10-lakh-survey-423617-2024-03-31)
51. [LBNL — Electrical consumption of 2-, 3-, 4-wheel EVs in India](https://emp.lbl.gov/publications/electrical-consumption-two-three-and)
52. [Bolt.Earth — State of EV charging in India 2026](https://bolt.earth/blog/the-current-state-of-ev-charging-in-india-2026-public-home-and-fleet-networks)
53. [IEA — Global EV Outlook 2026: EV charging](https://www.iea.org/reports/global-ev-outlook-2026/electric-vehicle-charging-chap-6-and-10)
54. [EVsWorldwide — EV charging by country 2026 (IEA data)](https://evsworldwide.com/blog/ev-charging-stations-by-country)
55. [Electrive — Only one EU country misses AFIR target](https://electrive.com/2026/07/20/only-one-eu-country-misses-afir-charging-target)
56. [European Commission — AFIR overview (POLIS)](https://www.polisnetwork.eu/wp-content/uploads/2023/06/Day1-EuropeanCommission-AFIR.pdf)
57. [Deccan Herald — Delhi open database for EV charging & swapping](https://www.deccanherald.com/india/delhi-govt-launches-open-database-for-ev-charging-battery-swapping-stations-1144788.html)
58. [CSTEP — Bengaluru 2030: EV charging demand and infrastructure](https://cstep.in/publication/press-release-bengaluru-2030-ev-charging-demand-and-infrastructure/)
59. [ICCT — National study of India's e-truck charging needs](https://theicct.org/wp-content/uploads/2025/09/First-national-study-maps-Indias-e-truck-charging-needs-identifies-5-states.pdf)
60. [Outlook Business — FICCI: ₹16,000 cr capex for public charging by 2030](https://www.outlookbusiness.com/planet/industry/india-needs-rs-16000-crore-capex-to-meet-public-ev-charging-demand-by-2030-ficci-report)
61. [IISc energy database — Delhi set-cover (Current Science 2022)](https://wgbis.ces.iisc.ac.in/energy_database?page=250) · [NRDC — EV charging: location is everything](https://www.nrdc.org/experts/sameer-kwatra/ev-charging-infrastructure-location-everything)
