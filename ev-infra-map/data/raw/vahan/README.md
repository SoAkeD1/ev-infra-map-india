# VAHAN extracts: how these files were made

- **Source:** VAHAN 4 Dashboard (MoRTH), `https://vahan.parivahan.gov.in/vahan4dashboard/vahan/view/reportview.xhtml`
- **Read on:** 17 Oct 2026, by reading the rendered tables in a browser. Nothing was downloaded. Every page of each table was read (25 rows per page).
- **Query settings:**

  | Setting | Value |
  |---|---|
  | Type | Actual Value |
  | State | Odisha (OR) / Karnataka (KA) |
  | RTO | All Vahan4 Running Office |
  | Y-axis | Rto |
  | X-axis | Vehicle Class |
  | Year Type | Financial Year |
  | Year | each FY from 2017-2018 to 2025-2026 |
  | Fuel filter (left panel) | **ELECTRIC(BOV) + PURE EV**, then Refresh |

- **All-fuel file:** `vahan_odisha_allfuel_segment_fy2025.csv` uses the same query with no fuel filter, for FY 2025-26. It is the market baseline for the High scenario.
- **Grouping vehicle classes into segments** (done at extraction time):

  | Segment | VAHAN vehicle classes |
  |---|---|
  | 2W | M-Cycle/Scooter, Moped, Motorised Cycle, With Side Car, Used For Hire |
  | 3W_AUTO | Three Wheeler (Passenger / Goods / Personal) |
  | 3W_ERICK | e-Rickshaw(P), e-Rickshaw with Cart (G) |
  | 4W | Motor Car, Motor Cab, Private Service Vehicle, Maxi Cab |
  | BUS | Bus, Omni Bus |
  | OTHER | goods carriers, construction equipment, tractors, etc. |

- **Checks:**
  - In the Odisha file, the sum of the segments equals the VAHAN TOTAL column for every FY.
  - Odisha FY 2025-26 EV share = 92,599 / 943,141 = 9.8%. A news report put Odisha's EV share at 9.5% for 2025.
  - Karnataka FY 2024-25 = 174,003. A news report put it at 1.73 lakh.
  - Karnataka FY 2025-26 = 221,592. A news report put it at about 2.3 lakh.
- **Karnataka** is saved at state level only (all 66 RTOs summed). The RTO-level tables were read, but Karnataka districts were not needed in this phase.
