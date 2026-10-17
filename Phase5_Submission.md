# Phase 5: Round 1 submission document
**EV Infra Map India (C1) · Team TM-72BD3802D52 · 17 Oct 2026**

## Deliverables
| File | What it is |
|---|---|
| `Final_Round1_Submission.pdf` | **The file to submit:** 11 pages (cover and contents, 9 body pages, 1 appendix page) |
| `Final_Round1_Submission.docx` | Editable version. Fill in the placeholders here, then re-export the PDF. |
| `ev-infra-map/report/figures/c1_pipeline.png` … `c4_journeys.png` | Diagrams C1–C4 (pipeline, architecture, logic, user journeys), high-resolution PNG |
| `ev-infra-map/report/diagrams/*.mmd` | Mermaid source for each diagram |
| `ev-infra-map/outputs/figures/odisha_ev_registrations_fy18_fy26.png` | New chart: Odisha EV registrations by segment |
| `ev-infra-map/outputs/tables/gap_index_weight_sensitivity.csv` | Gap Index weight-sensitivity test |
| `ev-infra-map/outputs/tables/gap_index_obs_vs_scaled.csv` | Gap Index ranks from observed vs scaled charger counts |
| `ev-infra-map/report/build_docx.js` | Script that builds the document |

## Step 0 results (new evidence)
| Test | Result |
|---|---|
| Weight variants: equal, six ±10-point shifts, PCA (0.46/0.40/0.13) | Spearman ρ **0.95–0.98**; top-10 overlap **8–10/10**; max rank change ≤ 6. **Passes** (ρ ≥ 0.85, overlap ≥ 8). |
| Leave one component out | ρ 0.75 / 0.83 / 0.88. Each component adds information. |
| Momentum capped at the 95th percentile | No change (ρ = 1.00) |
| Observed vs scaled charger counts | Max rank change **5**; only **Gajapati** (no mapped charger) reaches it |

## Document map vs rubric
| Criterion | Sections |
|---|---|
| Problem Understanding (25) | 1 Executive summary · 2 Problem · 3 Users and scope |
| Feasibility (25) | 5 Done vs Round 2 · 6 Integration · 7–10 results · 12 Validation · 13 Architecture · 15 Risks |
| Innovation (20) | 8 Norm compliance · 10 DC = max rule · 11 MCLP siting · 16 Innovation |
| Roadmap Clarity (20) | 14 Weekly plan, go/no-go milestones, fallbacks, Gantt |
| Data Strategy (10) | 4 Data strategy · Appendix A1 (27 sources) · Appendix A2 (synthetic/assumed data) |

## Before submitting (by 29 Oct)
- [ ] Fill in **[TEAM NAME]** and **[MEMBER NAMES]** (2–5 members) in the .docx, then re-export the PDF.
- [ ] Confirm the contact email matches the one registered on the portal.
- [ ] Check the Techfest portal (Doubt section) for any page limit or template.
- [ ] Verify the **Odisha 606** charger count against the MHI annexure on sansad.in. It affects headline 1 and the 38% completeness figure.
- [ ] Set the exact submission date on the cover.
- [ ] Team Leader submits **once**.
