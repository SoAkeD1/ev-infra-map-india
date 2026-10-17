# Phase 1 — Scope Lock · EV Infra Map India (C1) · TM-72BD3802D52

> ⚠ = assumption or figure not confirmed; check before submitting. Numbers in [brackets] refer to the Sources list.
>
> **Revised after Phase 2** (see [Phase2_DataResearch.md](Phase2_DataResearch.md)):
> - The **27,737 / 22,753** figure covers **oil-company (OMC) stations only**, not all public chargers. The latest official national count is **52,718 stations** (MHI Rajya Sabha reply, 29 Jul 2026), with Karnataka at 6,805 and Odisha at about 606 (Dec 2025).
> - **MoP norms** are now those of the **17 Sep 2024** guidelines: 1×1 km urban grid, 20 km on highways, 100 km for heavy vehicles.
> - **Odisha EV Policy 2025** is still a **draft** (50% EV share target by 2030). The 2021 policy has been extended to 31 Dec 2026.
>
> Sections 2–5 below keep the original Phase 1 text; the Scope Summary table is updated.

## 1. Target users & decisions

| User | Decision they make | Platform output they'd use |
|---|---|---|
| **MHI** | Where PM E-DRIVE charger subsidy goes (72,300 PCS, ₹2,000 cr, runs to Mar 2028) [5] | State/district gap ranking; chargers-needed per state, split by charger type |
| **ICAT** | Technical evaluation and validation of planning methods, charger types and standards | Transparent, reproducible methodology; charger-type mix per segment; validation report |
| **BEE** (central nodal agency) [4] | Tracking national rollout against MoP norms | Coverage % against the 3×3 km city grid and 25 km highway norm |
| **State transport depts** | EV policy targets, incentive allocation, PM E-DRIVE site requests (e.g. Odisha asked for 190 PCS in 6 cities) [8] | District gap index; 2030 needs under 3 scenarios |
| **DISCOMs** (state nodal agency) [4] | Grid upgrades and connection capacity | Charging load (kW) per district or cell; candidate sites near substations |
| **ULBs** | Allocating public land for PCS (Odisha draft SOP lets ULBs do this) [8] | Ranked candidate sites inside the city; uncovered grid cells |
| *NHAI / OMCs (secondary)* | Highway charger placement | NH corridor gaps (segments longer than the spacing norm) |

## 2. Pilot geography

### Odisha (primary) — confirmed sensible

| Metric | Value | Source |
|---|---|---|
| EVs registered (cumulative) | ~2.19 lakh (early 2025) | Odisha Economic Survey 2025-26 [9] |
| Annual EV registrations | 44,545 (2023) → 65,977 (2024) | State assembly [10] |
| EV share of new registrations | 1.16% (2021) → 8.71% (Jun 2025) | State govt [10] |
| Public charging stations | ~550 incl. captive (OEM/DISCOM/OMC) ⚠ | [8] |
| Pipeline | 170 PCS / 688 points + 4 swap stations, 6 cities, ₹40.5 cr PM E-DRIVE | [8] |
| Policy | EV Policy 2021 extended to 31 Dec 2026; EV Policy 2.0 target of 50% BEV registrations by 2036 ⚠ | [11] |
| Districts | 30 | — |

**Why Odisha:** fast-growing adoption on a thin network (≈400 EVs per station, about 2× Karnataka). Public chargers are concentrated in Bhubaneswar and Cuttack, and mining, port and tribal districts have almost none. The state is planning new stations right now, so findings have a live user.

### Comparison state

| | **Karnataka** | Maharashtra | Delhi |
|---|---|---|---|
| EV fleet | ~8.9 lakh (Aug 2026) [12] | ~11.3 lakh [13] | n/a; >83k registered in FY25 [14] |
| Annual EV registrations | ~2.3 lakh (FY26) | ~2.95 lakh (FY26) | ~10.7k/month (Jul 2026) |
| Public charging stations ⚠ | 3,150–6,097 (#1 or #2 nationally) | 2,980–4,166 | 1,967–2,380 stations; 8,849 points |
| EVs per station (indicative) | ~150–280 | ~270–380 | n/a |
| Districts | 31 (≈ Odisha's 30) | 36 | 11–13 (city-state) |
| NH corridors | Bengaluru–Mysuru, Bengaluru–Chennai, NH-48 | Mumbai–Pune, Samruddhi | Few inside its boundary |
| Data access | On VAHAN; OpenCity Bengaluru RTO data [15]; OCM/OSM dense | On VAHAN; big but heterogeneous | Strong open data, but no rural or corridor analogue |

**Recommendation: Karnataka.**
- It is the most mature public network, so it serves as the "what good looks like" benchmark for Odisha.
- It has nearly the same number of districts, so the comparison is like-for-like.
- It has real NH corridors and good open data.
- Its internal Bengaluru-vs-rest gap shows the method works beyond one state.
- Rejected: **Delhi** (a city-state with no district or corridor contrast), **UP** (high EV numbers, but dominated by low-speed e-rickshaws that rarely use public chargers, which distorts ratios), and **Maharashtra** (a valid backup with 36 districts and more cleaning work).

## 3. Unit of analysis

**Decision: report by district, compute on H3 hexagons, and add NH corridor segments.**

| Unit | Pros | Cons | VAHAN supports? |
|---|---|---|---|
| **District** (reporting) | Matches how govt plans; Census, population and LGD data all exist at this level | Hides gaps inside a district | **Indirectly:** VAHAN is RTO-level, so an RTO→district crosswalk is needed ⚠ |
| RTO | Native VAHAN unit | Not an admin unit; some RTOs cover several districts and some districts have several RTOs | Yes |
| **H3 hexagons** (res 7 ≈ 5 km², or res 8) (computing) | Uniform cells; directly testable against the 3×3 km norm; good for siting | No EV data at cell level, so EVs are allocated down by population or night-lights (modelled, not observed) | No |
| **NH corridor** segments (e.g. 25 km) | Matches the MoP highway norm; covers 4W and bus long-distance trips | Needs traffic proxy (AADT is mostly unavailable) ⚠ | No (proxy) |

- Districts are what users decide on. H3 cells are what the siting model needs.
- Every H3 number rolls up to a district total.

## 4. Vehicle segments

| Segment | Charging behaviour | Public need | Scope |
|---|---|---|---|
| **2W** | Mostly home slow AC; public use is opportunistic. Delivery fleets use public chargers or swapping. 2W = 78% of public sessions in metros [16] | Low per vehicle, high in total | **In** — the largest share of the fleet (~84% in Maharashtra) |
| **3W – e-rickshaw (L3)** | Home or depot overnight; informal charging | Low (public) | **In (stock only); separate flag.** Excluded from the public-charger ratio ⚠ |
| **3W – e-auto / L5 cargo** | Depot plus mid-day public top-ups; swapping common | **High** | **In** |
| **4W (cars)** | Home AC where parking exists; public DC on highways and in dense cities. 4W draw 67% of public energy [16] | **High energy** | **In** — drives DC and corridor need |
| **Bus** | Depot charging planned by STUs/operators (PM e-Bus Sewa); 1,800 PM E-DRIVE bus chargers [5] | Depot, not public | **Out of gap index**; depots shown as a context layer |
| Trucks / LCV-N | Emerging | — | **Out** |

> Home charging covers ~80–90% of EV energy needs [17]. Each segment therefore gets a **public-charging share** parameter, with sensitivity tested. That parameter is the key assumption.

## 5. Charger types

| Type | Spec (typical) | Serves | Treatment |
|---|---|---|---|
| **AC slow** | 3.3–22 kW (LEV AC, Type 2) | 2W, 3W, 4W at destinations | Count in city coverage (H3) |
| **LEV DC** | ~12–15 kW (Bharat DC-001 / LECCS) | 2W, 3W fleets | Group with AC as "light" chargers |
| **DC fast** | ≥30–60 kW, CCS2 | 4W, (bus) | Count separately; drives corridor analysis |
| **Battery swap** | Station-based | 2W, 3W (fleet) | **Separate layer**; converted to charger-equivalents by daily swap capacity ⚠ |

- The data model counts **charge points and kW**, not just stations; one station can have 1 to 20+ points.
- Gap index and needs are calculated **separately for "light" (AC + LEV DC) and DC fast chargers**, then combined.
- Where a source doesn't say whether a charger is AC or DC, impute it from operator and rated kW, and flag the record.

## 6. Time horizon

| Item | Choice | Link |
|---|---|---|
| Base year | **FY 2025-26** (Apr 2025–Mar 2026; last complete year) | Matches the national charger snapshot (1 Mar 2026) [1] |
| History for forecast | FY 2019-20 → FY 2025-26 (7 yrs) | Pre/post FAME-II and PM E-DRIVE |
| Interim milestone | **FY 2027-28** | PM E-DRIVE ends Mar 2028 [5] |
| **Forecast year** | **FY 2029-30** | National 30% EV sales-share target by 2030 [6]; Delhi EV Policy 2.0 to Mar 2030 |
| Stretch (Odisha only) | 2036 | Odisha EV Policy 2.0: 50% BEV registrations ⚠ |
| Scenarios | Low (current CAGR, decaying) / Base / High (30% sales share by 2030) | — |

## 7. Problem statement

> **"Where do India's public EV chargers fall short of its EV fleet today, and how many chargers of which type are needed, and where, by 2030?"**

| # | Measurable output | Unit |
|---|---|---|
| 1 | **Charging Gap Index** (0–100) plus EVs per charge point and % area within the 3 km norm | per district (Odisha + Karnataka) |
| 2 | **Charger requirement, FY 2029-30**, light vs DC, under 3 scenarios | per district |
| 3 | **Recommended new sites** (top-N H3 cells) plus **NH corridor gaps** above the 25 km norm | ranked list + map |

## 8. Out of scope (Round 2)

| Out | Why |
|---|---|
| Private/home and captive fleet chargers | Not public; no data. Handled only through the home-share parameter |
| Pricing, tariffs, business viability of chargers | Not a coverage question; ToD and tariff data are fragmented |
| Real-time availability / uptime | Needs operator APIs; installed vs operational (27,737 vs 22,753 [1]) handled as a static derate |
| Detailed grid power-flow / feeder capacity | DISCOM data isn't public; substation proximity used as a proxy |
| Bus depots, trucks, HCVs | Depot-planned / nascent; context layer only |
| All 36 states/UTs in the prototype | Pilot is 2 states; method is built to scale nationally (roadmap) |
| Charger hardware, connector interoperability, payments | Standards are ICAT/BIS territory, not planning |
| Exact land availability / site permits | ULB-level task; we output candidate cells, not parcels |

---

## ⚠ Flags — assumptions & hard-to-access data

| Item | Risk | Fallback |
|---|---|---|
| **State charger counts disagree by up to 2×** across sources [1][2][3] | Gap index sensitive to the denominator | Build our own deduplicated count from OCM + OSM + operator listings; check against the national total [1]. The official PIB state table couldn't be fetched (403) — **get it manually** |
| **VAHAN export limits** (captcha, manual RTO-wise exports) | Slow collection | Third-party VAHAN mirrors (IndiaDataPortal, Dataful) [15]; document date |
| **RTO→district crosswalk** | Not published | Build manually from state transport RTO jurisdiction lists + LGD codes |
| VAHAN = cumulative registrations | Overstates active fleet (scrapped vehicles still counted) | Small for young EV fleet; apply ~1–2%/yr attrition ⚠ |
| Odisha 550 PCS includes captive | Overstates public supply | Filter to public-access records |
| MoP norms: 3×3 km city, 25 km highway, 100 km heavy/long-range (2019/2022) [4] | A 2024 MoP revision reportedly tightens these | **Verify on powermin.gov.in** before citing |
| Odisha EV Policy 2.0 (2036) status | Announced; formal notification not confirmed | Use only as stretch scenario |
| E-rickshaw (L3) public-charging share | No data | Treat as ~0 public, sensitivity test |
| Battery-swap capacity | Operators don't publish | Assume N swaps/day/station; label synthetic |
| Telangana missing/partial on VAHAN ⚠ | Only matters for national scale-up | Note in scalability roadmap |

---

## SCOPE SUMMARY (paste-ready)

| Dimension | Decision | Rationale |
|---|---|---|
| **Problem** | Where do public EV chargers fall short of the EV fleet today, and how many of which type are needed where by 2030? | Directly answers the challenge objective |
| **Primary users** | MHI, ICAT, BEE; state transport depts, DISCOMs, ULBs | Each maps to a concrete allocation or siting decision |
| **Pilot geography** | **Odisha** (primary) + **Karnataka** (benchmark) | Fast-growing, under-served state vs mature network; 30 vs 31 districts |
| **Unit of analysis** | District (reporting) · H3 hexagons — res 8 urban / res 7 rural (computing/siting) · NH segments (corridors) | Matches govt planning unit + MoP 2024 spacing norms |
| **Vehicle segments (in)** | 2W, 3W (e-auto / L5; e-rickshaw as separate flag), 4W | Account for nearly all EVs and public demand |
| **Segments (out)** | Buses (depot context layer), trucks | Depot-planned / nascent |
| **Charger types** | Light (AC ≤22 kW + LEV DC) · DC fast (≥30 kW) · battery swap (separate layer) | Different segments, different gaps |
| **Supply metric** | Public charge points + kW (not just stations), operational-derated | Stations vary 1–20+ points |
| **Base year** | FY 2025-26 | Latest complete VAHAN year; national charger snapshot Mar 2026 |
| **Forecast** | FY 2029-30 (milestone FY 2027-28); Low/Base/High scenarios | National 30% EV-sales goal; PM E-DRIVE ends Mar 2028 |
| **Outputs** | ① District Charging Gap Index ② 2030 charger need (light/DC) ③ Ranked new sites + NH corridor gaps | Measurable, map-ready |
| **Benchmarks** | MoP Guidelines 17 Sep 2024: ≥1 PCS / 1×1 km urban by FY 2030, every 20 km both sides (highway), fast charger every 100 km for heavy/long-range | Official norms for validation |
| **Out of scope** | Home/captive chargers, pricing, real-time uptime, feeder-level grid, permits, hardware standards | Keeps the prototype buildable and defensible |
| **Data rule** | All sources attributed; synthetic data (e.g. swap capacity, sub-district allocation) labelled | Required by competition rules |

---

## Sources
1. [PIB / MHI — Status and Expansion of EV Charging Infrastructure (Mar 2026)](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2246042&reg=3&lang=1)
2. [VahanBazaar — EV charging stations 27,700, state-wise (Mar 2026)](https://vahanbazaar.in/news/ev-charging-stations-27700-india-march-2026-state-wise)
3. [MeraEV — EV charging stations India 2026 state-wise](https://www.meraev.com/blog/ev-charging-stations-india-2026-state-wise-map) · [India Data Report](https://indiadatareport.com/state-wise-ev-charging-stations-india/)
4. [JMK Research — Decoding MoP EV charging guidelines](https://jmkresearch.com/decoding-ev-charging-guidelines) · [Autocar Pro — MoP amends guidelines](https://autocarpro.in/news-national/power-ministry-amends-ev-charging-guidelines-and-specifications-44287) · [e-AMRIT standards](https://e-amrit.niti.gov.in/standards-and-specifications)
5. [Free Press Journal — PM E-DRIVE 72,300 PCS guidelines](https://www.freepressjournal.in/amp/business/pm-e-drive-scheme-centre-issues-operational-guidelines-for-deployment-of-72300-public-ev-charging-stations-with-2000-crore-outlay) · [India Sea Trade News — PM E-DRIVE extension](https://indiaseatradenews.com/govt-extends-pm-e-drive-scheme-in-some-categories/)
6. [NITI Aayog — NITI Sandhan newsletter, Oct 2025 (30% by 2030)](https://www.niti.gov.in/sites/default/files/2025-10/Newsletter-NITI-SandhanOct-25.pdf)
7. [JMK Research — EV Sales Digest Jul 2025](https://jmkresearch.com/wp-content/uploads/2025/08/EV-Sales-Digest-july-2025-JMK-Research.pdf)
8. [BioEnergy Times — Odisha gets ₹40.5 cr under PM E-DRIVE](https://bioenergytimes.com/odisha-gets-rs-40-50-crore-under-pm-e-drive-scheme-for-ev-charging-network/) · [CarBike360 — Odisha seeks 190 PCS](https://www.carbike360.com/news/odisha-seeks-190-ev-charging-stations-in-six-cities-under-pm-e-drive-scheme) · [BioEnergy Times — Odisha draft SOP](https://bioenergytimes.com/odisha-drafts-sop-to-accelerate-ev-charging-infrastructure-across-urban-areas/)
9. [OdishaBytes — Over 2.19 lakh EVs in Odisha](https://odishabytes.com/over-2-19-lakh-evs-on-roads-in-odisha-with-12-charging-stations-in-bhubaneswar/)
10. [Sakshi Post — EVs in Odisha: Minister](https://www.sakshipost.com/news/many-161338-evs-plying-roads-odisha-minister-389157) · [The Week — Odisha EV Policy 2.0](https://www.theweek.in/wire-updates/business/2025/06/25/ces27-od-ev-policy.html)
11. [Odisha EV Policy 2021 (official PDF)](https://ct.odisha.gov.in/sites/default/files/2026-01/Odisha%20EV%20Policy-2021(New).pdf) · [ENERGDIVE — extension to Dec 2026](https://www.energdive.com/news/odisha-extends-electric-vehicle-policy-2021-till-december-2026)
12. [NewsKarnataka — Bengaluru drives Karnataka EV shift, Aug 2026](https://newskarnataka.com/bengaluru/bengaluru-drives-karnatakas-ev-shift-august-2026/28092026/) · [EVFY — Bengaluru Aug 2026 registrations](https://www.evfy.in/news/bengalurus-august-2026-ev-registrations-reach-13389-electric-vehicles-take-175-of-new-registrations-and-503-of-karnatakas-total)
13. [Down To Earth — Maharashtra has second-largest EV fleet](https://www.downtoearth.org.in/air/india-on-e-wheels-maharashtra-has-second-largest-ev-fleet-but-official-said-numbers-mask-adoption-gaps) · [Free Press Journal — Maharashtra FY26 registrations](https://www.freepressjournal.in/amp/mumbai/mumbai-leads-charge-in-maharashtra-as-ev-registrations-surge-by-23-in-2025-26)
14. [Drishti IAS — Delhi EV Policy 2.0](https://www.drishtiias.com/daily-updates/daily-news-analysis/delhi-electric-vehicle-policy-20) · [NewsBytes — Delhi July 2026 EVs](https://www.newsbytesapp.com/news/auto/delhi-records-10719-evs-in-july-amid-ev-policy-20/tldr) · [Down To Earth — Delhi e-transition](https://www.downtoearth.org.in/amp/story/air/india-on-e-wheels-national-capitals-march-towards-e-transition)
15. [IndiaDataPortal — VAHAN registrations](https://ckandev.indiadataportal.com/dataset/vahan-vehicle-registrations/resource/808d2b3c-dcdd-48fc-ae6a-cc99e137ec9c) · [Dataful VAHAN datasets](https://dataful.in/datasets/22379) · [OpenCity — Bengaluru RTO data 2024](https://data.opencity.in/dataset/bengaluru-rto-wise-vehicle-registration-data/resource/rto-wise-vehicle-registration-data-2024)
16. [Autocar Pro — Bolt.Earth: 2W 78% of sessions, PVs 67% of energy](https://www.autocarpro.in/news/2w-drive-78-percent-of-ev-charging-sessions-pvs-draw-67-percent-power-boltearth-134608)
17. [EVreporter — Kazam & AEEE residential charging report](https://evreporter.com/kazam-and-aeee-launch-report-on-residential-ev-charging-in-india/)
18. [NITI Aayog draft battery swapping policy (2022)](https://www.techradar.com/news/niti-aayog-releases-draft-battery-swapping-policy-for-evs-whats-in-it)
