# EV Infra Map India ⚡
**A VAHAN-linked, norm-aware planning engine for public EV charging**

Techfest IIT Bombay 2026-27 · EV Infra & Green Mobility AI Challenge (MHI × ICAT) · **Challenge 1: EV Infra Map India**
Team **Havoc** · Team ID **TM-72BD3802D52** · C.V. Raman Global University, Bhubaneswar · IIT (ISM) Dhanbad

> **Question:** where in India are public EV chargers missing today, and how many (light vs DC) are needed, and where, by FY 2029-30?
> **Round 1 submission:** [`Final_Round1_Submission.pdf`](Final_Round1_Submission.pdf)

---

## Headline results (Odisha pilot, real data, 17 Oct 2026)
| | Result |
|---|---|
| 🔌 Pressure on chargers | **~408 EVs per public station in Odisha vs ~106 in Karnataka (3.8×)** |
| 🏙️ Urban norm (MoP 2024, 1×1 km) | **24.6%** of Bhubaneswar has a charger within 1 km; 19 stations vs ~147 needed |
| 🛣️ Highway norm (20 km spacing) | NH-16: **6 gaps > 20 km** (max 49 km); DC only: max 78 km |
| 📈 Need by FY 2029-30 | **~2,940 public charge points (Base)**, range 2,510–5,380, vs ~740 today (~4×) |
| ✅ Forecast backtest | **10.2% MAPE** (Holt) vs 507% (log-linear, rejected) |

![Gap map](ev-infra-map/outputs/figures/odisha_gap_map.png)

---

## 🧠 Modelling engine: our core (ML and analytics)
Our focus is **models that are accurate, explainable and stress-tested**, not black boxes. With 7 annual data points per segment, complex ML would overfit, so every model is chosen by out-of-sample tests.

### 1. Demand forecasting: learned time-series model
- **Model:** Holt damped-trend exponential smoothing per vehicle segment. Smoothing (α, β) and damping (φ) are **learned from VAHAN data** by maximum likelihood.
  `ŷ(t+h) = ℓ_t + (φ + φ² + … + φ^h)·b_t`
- **Model selection by backtest** (train FY20–24, predict FY25–26):

  | Segment | Holt (chosen) | Log-linear |
  |---|---|---|
  | 2W | 6.2% | 488% |
  | 4W | 16.9% | 1,276% |
  | 3W e-auto / e-rickshaw | 48.4% / 45.8% | 334% / 172% |
  | **Weighted** | **10.2%** | **507%** |
- **Scenarios:**
  - **Low:** decaying CAGR
  - **Base:** Holt
  - **High:** 50% EV share of new registrations by FY30 (draft Odisha policy)

  FY30 EV stock: 6.8 / **8.3** / 14.4 lakh, against 2.47 lakh today.

### 2. Charging Gap Index: unsupervised scoring, validated with PCA
- `GI = 0.40·Load + 0.35·Access + 0.25·Momentum`, each component min-max normalised to 0–100:
  - **Load** = ln(1 + EVs per charge point)
  - **Access** = % of population more than 5 km from a charger
  - **Momentum** = FY24→26 registration growth rate (CAGR)
- **Robustness:** we tested 8 weight variants (equal weights, six ±10-point shifts, and **PCA-derived weights 0.46/0.40/0.13**):
  - Spearman ρ **0.95–0.98** against the base ranking
  - top-10 overlap **8–10/10**
  - leave-one-out tests (ρ 0.75–0.88) show every component adds information

### 3. Charger requirement: physics-based demand model
- `kWh/day = EV stock × km/day × Wh/km × public-charging share`, converted to light (<30 kW) and DC (≥30 kW) charge points.
- **New rule: DC need = max(energy-based, corridor-norm)**, where the corridor norm is ⌈NH km / 20⌉ × 2 sides.
  - Example, Baleshwar district: energy alone needs 4.3 DC points, the corridor rule needs 12.
- **Sensitivity:** ±30% on public-charging share or utilisation keeps 9–10 of the top-10 gap districts.

### 4. Siting: optimisation (Round 2)
- **Maximal Covering Location Problem** on H3 cells:
  - maximise unmet demand covered within a budget N (e.g. the 170 PM E-DRIVE stations)
  - penalise sites far from substations (grid-aware)
  - solver: PuLP/CBC, with a greedy fallback (≥ 63% of optimum)

### 5. Planned ML upgrades (Round 2)
- **Gradient-boosted district adoption model** (population, night-lights, urbanisation, charger access → district EV growth). Replaces the current fixed-share district allocation.
- **Hierarchical forecast reconciliation:** district forecasts sum to the state total.
- **Siting hold-out test:** hide 30% of existing chargers and check whether the model recovers them.

---

## Methodology by phase (short)
| Phase | What we did | Key output |
|---|---|---|
| **1 · Scope** | Users (MHI, ICAT, states, DISCOMs, ULBs); Odisha pilot + Karnataka benchmark; district / H3 / NH units; 2W/3W/4W; FY 2025-26 → FY 2029-30 | [`Phase1_Scope.md`](Phase1_Scope.md) |
| **2 · Data research** | Sources and fallbacks, access checks, MoP 2024 norms (1 km urban, 20 km highway), planning parameters, existing-platform review, USP | [`Phase2_DataResearch.md`](Phase2_DataResearch.md) |
| **3 · EDA + forecast** | Read VAHAN (RTO × class × FY); built de-duplicated charger census (OCM + OSM); EDA; Holt forecast + backtest; charger need; draft Gap Index; norm checks | [`Phase3_EDA_Forecast.md`](Phase3_EDA_Forecast.md) |
| **4 · Design** | 10-stage pipeline; method specs; MCLP formulation; validation plan; architecture; assumptions register | [`Phase4_Design.md`](Phase4_Design.md) |
| **5 · Submission** | Weight-sensitivity tests; diagrams; 11-page methodology + roadmap document | [`Final_Round1_Submission.pdf`](Final_Round1_Submission.pdf) · [`Phase5_Submission.md`](Phase5_Submission.md) |
| **6 · Review and submit** | Rubric check, add member names, verify Odisha official count, single submission by Team Leader (due 30 Oct 2026) | In progress |

**Round 2 roadmap (7 Nov → 16 Dec 2026):**
- W1 data hardening
- W2 Gap Index, forecast and need module
- W3 MCLP siting and validation
- W4 FastAPI + React/Leaflet dashboard
- W5 Karnataka run and documents
- W6 demo video

---

## Data (all public, attributed)
| Layer | Source |
|---|---|
| EV registrations | VAHAN 4 dashboard (MoRTH): RTO × vehicle class × FY, fuel = ELECTRIC(BOV) + PURE EV |
| Public chargers | OpenChargeMap export (22 Apr 2026) + OpenStreetMap; reconciled with MHI counts. Completeness: Odisha 38%, Karnataka 6%. |
| Boundaries, roads, NH | OpenStreetMap (ODbL) |
| Population | WorldPop 2020 (CC BY 4.0) |

Assumed and synthetic values are flagged in the data (`is_assumed`, `is_synthetic`, `is_kw_imputed`) and listed in [`data_quality_log.md`](ev-infra-map/outputs/tables/data_quality_log.md).

---

## Repository layout
```
├── Final_Round1_Submission.pdf / .docx   Round 1 document
├── Phase1..5_*.md                        phase write-ups
└── ev-infra-map/
    ├── notebooks/   build_notebook.py → 01_eda_forecast.ipynb (full analysis)
    ├── data/raw/    VAHAN extracts (+ README), OCM export, OSM, WorldPop
    ├── data/processed/  RTO→district crosswalk, merged chargers, districts
    ├── outputs/     findings.md, figures/, tables/ (incl. data_quality_log.md)
    └── report/      diagrams (Mermaid), document builder
```

## Reproduce
```bash
cd ev-infra-map
python -m venv .venv && .venv/Scripts/pip install -r requirements.txt   # Linux/Mac: .venv/bin/pip
cd notebooks
../.venv/Scripts/python build_notebook.py
../.venv/Scripts/python -m jupyter nbconvert --to notebook --execute --inplace 01_eda_forecast.ipynb
```

**Tech stack:** Python (pandas, geopandas, h3, rasterio, statsmodels, scipy) · PuLP · PostGIS · FastAPI · React + Leaflet. All open source.

**AI-tool disclosure:** Claude (Anthropic) assisted with research synthesis, code and drafting. All numbers are computed by our code from cited data and reviewed by the team.
