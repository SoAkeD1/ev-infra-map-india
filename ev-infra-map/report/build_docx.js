// Builds Final_Round1_Submission.docx. Usage: node build_docx.js [toc_pages.json]
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, HeadingLevel, Header, Footer, PageNumber, LevelFormat, BorderStyle, PageBreak,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader, VerticalAlign, TableLayoutType, TabStopType, Tab,
} = require('docx');

const ROOT = path.resolve(__dirname, '..');
const FIG = (p) => path.join(ROOT, p);
const TOC = fs.existsSync(process.argv[2] || '') ? JSON.parse(fs.readFileSync(process.argv[2])) : {};
const W = 9752;                 // text width in DXA (A4, 1.9 cm margins)
const BLUE = '1F4E79', LIGHT = 'DBE9F6', ALT = 'F3F6FA', ORANGE = 'FDE9D9', GREY = 'EEEEEE';
const FONT = 'Arial';

// ---------- text helpers ----------
function runs(text, o = {}) {
  // **bold**, _italic_ (simple, non-nested)
  const out = [];
  const parts = String(text).split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean);
  for (const p of parts) {
    if (p.startsWith('**')) out.push(new TextRun({ text: p.slice(2, -2), bold: true, font: o.font || FONT, size: o.size, color: o.color }));
    else if (p.startsWith('__')) out.push(new TextRun({ text: p.slice(2, -2), italics: true, font: o.font || FONT, size: o.size, color: o.color }));
    else out.push(new TextRun({ text: p, bold: o.bold, italics: o.italics, font: o.font || FONT, size: o.size, color: o.color }));
  }
  return out;
}
const P = (t, o = {}) => new Paragraph({ children: runs(t, o), spacing: { after: o.after ?? 80, before: o.before ?? 0, line: 264 }, alignment: o.align, keepNext: o.keepNext });
const B = (t, lvl = 0) => new Paragraph({ children: runs(t), numbering: { reference: 'bul', level: lvl }, spacing: { after: 40, line: 252 } });
const N = (t) => new Paragraph({ children: runs(t), numbering: { reference: 'num', level: 0 }, spacing: { after: 40, line: 252 } });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t })], spacing: { before: 200, after: 100 }, keepNext: true });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t })], spacing: { before: 140, after: 60 }, keepNext: true });
const BR = () => new Paragraph({ children: [new PageBreak()] });
const SP = (a = 60) => new Paragraph({ children: [], spacing: { after: a } });

// ---------- tables ----------
const border = { style: BorderStyle.SINGLE, size: 4, color: 'B7C4D1' };
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
function cell(content, width, o = {}) {
  const paras = (Array.isArray(content) ? content : [content]).map((c) =>
    c instanceof Paragraph ? c : new Paragraph({ children: runs(c, { size: o.size || 17, bold: o.bold, color: o.color }), alignment: o.align, spacing: { after: 0, line: 240 } }));
  return new TableCell({
    children: paras, width: { size: width, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 }, columnSpan: o.span,
  });
}
function table(widthsPct, header, rows, o = {}) {
  const ws = widthsPct.map((p) => Math.round((W * p) / 100));
  ws[ws.length - 1] += W - ws.reduce((a, b) => a + b, 0);
  const trs = [];
  if (header) trs.push(new TableRow({ tableHeader: true, cantSplit: true, children: header.map((h, i) => cell(h, ws[i], { fill: BLUE, color: 'FFFFFF', bold: true, size: o.size || 17 })) }));
  rows.forEach((r, ri) => trs.push(new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, ws[i], { size: o.size || 17, fill: (o.hl && o.hl(ri, i)) || (ri % 2 ? ALT : undefined), bold: o.boldFirst && i === 0 })) })));
  return [new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: ws, rows: trs, borders, layout: TableLayoutType.FIXED }), SP(80)];
}
function box(lines, fill = LIGHT, size = 18) {
  return [new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W], borders,
    rows: [new TableRow({ children: [new TableCell({ width: { size: W, type: WidthType.DXA }, shading: { fill, type: ShadingType.CLEAR, color: 'auto' }, margins: { top: 100, bottom: 100, left: 160, right: 160 },
      children: lines.map((l) => (l instanceof Paragraph ? l : new Paragraph({ children: runs(l, { size }), spacing: { after: 50, line: 252 } }))) })] })],
  }), SP(80)];
}
const mono = (t) => new Paragraph({ children: [new TextRun({ text: t, font: 'Consolas', size: 17 })], spacing: { after: 30 } });

// ---------- figures ----------
let figNo = 0;
function figure(file, widthCm, caption, source) {
  figNo += 1;
  const buf = fs.readFileSync(FIG(file));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  const wpx = Math.round((widthCm / 2.54) * 96), hpx = Math.round((wpx * h) / w);
  return [
    new Paragraph({ children: [new ImageRun({ type: 'png', data: buf, transformation: { width: wpx, height: hpx } })], alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 40 } }),
    new Paragraph({ children: runs(`**Figure ${figNo}.** ${caption}`, { size: 17 }), alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 20 } }),
    new Paragraph({ children: runs(`Source: ${source}`, { size: 15, color: '555555', italics: true }), alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
  ];
}

// ---------- TOC (static, page numbers from pass 1) ----------
const SECTIONS = [
  ['1', 'Executive summary'], ['2', 'Problem and relevance'], ['3', 'Users and scope'], ['4', 'Data strategy'],
  ['5', 'Approach overview'], ['6', 'Data integration'], ['7', 'Gap assessment: Charging Gap Index'], ['8', 'Norm compliance'],
  ['9', 'Demand forecast'], ['10', 'Charger requirement'], ['11', 'Siting (Round 2)'], ['12', 'Validation'],
  ['13', 'Architecture and tech stack'], ['14', 'Implementation roadmap (7 Nov to 16 Dec 2026)'], ['15', 'Assumptions, risks and mitigations'],
  ['16', 'Innovation and scalability'], ['A1', 'Appendix: Sources'], ['A2', 'Appendix: Synthetic and assumed data register'], ['A3', 'Appendix: AI-tool disclosure'],
];
const title = (n, t) => (n.startsWith('A') ? `${n}. ${t.replace('Appendix: ', '')}` : `${n}. ${t}`);
function tocLines() {
  return SECTIONS.map(([n, t]) => new Paragraph({
    spacing: { after: 30 }, tabStops: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }],
    children: [new TextRun({ text: n.startsWith('A') ? `Appendix ${n}  ${t.replace('Appendix: ', '')}` : `${n}  ${t}`, font: FONT, size: 18 }),
      new TextRun({ children: [new Tab(), String(TOC[title(n, t)] || '..')], font: FONT, size: 18 })],
  }));
}

// =====================================================================
const C = [];
// ---------- cover ----------
C.push(SP(600));
C.push(new Paragraph({ children: [new TextRun({ text: 'Techfest IIT Bombay 2026-27  ·  EV Infra & Green Mobility AI Challenge (MHI × ICAT)', font: FONT, size: 20, color: '555555' })], spacing: { after: 120 } }));
C.push(new Paragraph({ children: [new TextRun({ text: 'EV Infra Map India', font: FONT, size: 56, bold: true, color: BLUE })], spacing: { after: 60 } }));
C.push(new Paragraph({ children: [new TextRun({ text: 'A VAHAN-linked, norm-aware planning engine for public EV charging', font: FONT, size: 30, color: '222222' })], spacing: { after: 120 } }));
C.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 4 } }, children: [new TextRun({ text: 'Challenge 1: EV Infra Map India  ·  Round 1: Concept, Methodology and Implementation Roadmap', font: FONT, size: 20 })], spacing: { after: 240 } }));
C.push(...table([30, 70], null, [
  ['**Team name**', 'Havoc'],
  ['**Team ID**', 'TM-72BD3802D52'],
  ['**Institutions**', 'C.V. Raman Global University, Bhubaneswar, Odisha · Indian Institute of Technology (Indian School of Mines), Dhanbad'],
  ['**Team Leader**', 'Shrimon Mishra'],
  ['**Team members**', '[MEMBER NAMES]'],
  ['**Contact**', 'shrimonmishralimitless@gmail.com'],
  ['**Date**', 'October 2026'],
], { size: 19, hl: (r, i) => (i === 0 ? LIGHT : undefined) }));
C.push(SP(200));
C.push(new Paragraph({ children: [new TextRun({ text: 'Contents', font: FONT, size: 24, bold: true, color: BLUE })], spacing: { after: 80 } }));
C.push(...tocLines());
C.push(BR());

// ---------- 1 Executive summary ----------
C.push(H1('1. Executive summary'));
C.push(P('**Problem.** India\'s public charging data is fragmented: official counts for the same state differ by up to 2× depending on who is counted. No tool links charger supply to the registered EV fleet or measures compliance with the Ministry of Power (MoP) 2024 siting norms. Planners cannot see where chargers are missing today, or how many are needed by FY 2029-30.'));
C.push(P('**Approach.**', { after: 30 }));
C.push(B('**Demand from VAHAN.** EV registrations (RTO × vehicle class × financial year) are mapped to districts and H3 hexagon cells. Supply is a de-duplicated public charger census built from open data and reconciled with MHI counts.'));
C.push(B('**Gap and norm compliance.** A transparent **Charging Gap Index** scores each district on load, access and momentum, and the platform measures compliance with the MoP norms (1×1 km urban grid; 20 km highway spacing).'));
C.push(B('**Need by FY 2029-30.** A backtested Holt forecast gives Low, Base and High EV stock, converted into light (<30 kW) and DC (≥30 kW) charge points, with **DC need = max(energy-based, corridor-norm)**.'));
C.push(B('**Siting and delivery.** A grid-aware maximal covering model recommends sites. Results are delivered through an open web map and dashboard. Pilot: **Odisha** (30 districts); benchmark: **Karnataka**.'));
C.push(P('**Unique contribution:** the first open, reproducible pipeline that links VAHAN EV demand to a de-duplicated charger census, measures MoP 2024 norm compliance, and sizes DC charging by corridor as well as energy.', { before: 40 }));
C.push(...box([
  '**Headline evidence from our working prototype (Odisha, data read 17 Oct 2026)**',
  '**1. ~408 EVs per public charging station in Odisha vs ~106 in Karnataka (3.8×).** EV stock FY 2025-26 from VAHAN: Odisha 2.47 lakh, Karnataka 7.25 lakh. Station counts from MHI: Odisha 606 (unverified), Karnataka 6,805.',
  '**2. Only 24.6% of Bhubaneswar has a public charger within 1 km.** There are 19 stations; the MoP 2024 norm implies about 147.',
  '**3. Odisha needs about 2,940 public charge points by FY 2029-30 (Base; range 2,510 to 5,380), against about 740 today**, roughly 4×. NH-16 has 6 stretches longer than 20 km with no public charger.',
], LIGHT, 18));
C.push(P('__Throughout this document, "Done" marks results already produced by our prototype on real data, and "Round 2" marks planned work.__', { size: 17, color: '444444' }));

// ---------- 2 Problem ----------
C.push(H1('2. Problem and relevance'));
C.push(...table([34, 22, 44], ['Charger count (same scope?)', 'Value', 'What it actually counts'], [
  ['India, MHI reply, Mar 2026 [7]', '27,737 stations', 'Oil-company (IOCL/BPCL/HPCL) stations only'],
  ['India, MHI Rajya Sabha reply, Jul 2026 [6]', '52,718 stations', 'All installed stations; no fast/slow split maintained'],
  ['Karnataka: OMC / BEE 2024 / MHI 2026 [7][9][6]', '2,400 / 5,765 / 6,805', 'Different scope and dates; up to 2.8× apart'],
], { size: 16 }));
C.push(B('**Counts conflict.** Sources differ on stations vs charge points, public vs captive chargers, installed vs operational, and date. There is no single trusted, geolocated public dataset.'));
C.push(B('**EV demand is outpacing chargers.** Odisha new EV registrations rose from 989 (FY 2019-20) to 91,715 (FY 2025-26). The EV share of new registrations is now **9.8%** (Figure 1) [1].'));
C.push(B('**Norms are not measured.** MoP Guidelines (17 Sep 2024) [5] set ≥1 public station per 1×1 km urban grid by FY 2030, one every 20 km on both sides of highways, and fast charging every 100 km for heavy vehicles. No public tool reports compliance.'));
C.push(B('**Decisions are being made now.** PM E-DRIVE funds 72,300 public stations (₹2,000 crore, to Mar 2028) [10]. Odisha has 170 stations / 688 points approved across 6 cities [11]. Allocation needs district-level evidence.'));
C.push(...figure('outputs/figures/odisha_ev_registrations_fy18_fy26.png', 13.5, 'Odisha new EV registrations by segment, FY 2017-18 to FY 2025-26 (in-scope segments).', 'VAHAN 4 dashboard (MoRTH), fuel = ELECTRIC(BOV) + PURE EV; read 17 Oct 2026 [1].'));

// ---------- 3 Users & scope ----------
C.push(H1('3. Users and scope'));
C.push(...table([18, 42, 40], ['User', 'Decision', 'Output they use'], [
  ['MHI / BEE', 'PM E-DRIVE allocation across states and cities; national tracking', 'State/district Gap Index ranking; FY30 need (light/DC); norm-compliance %'],
  ['ICAT', 'Technical evaluation of planning methods and charger mix', 'Transparent, reproducible method; validation report'],
  ['State transport dept.', 'EV policy targets; PM E-DRIVE site requests', 'District gaps; ranked candidate sites; 3 scenarios'],
  ['DISCOM', 'Grid upgrades, connection capacity', 'kW added per substation area; grid-aware sites'],
  ['Urban local body', 'Public land for charging stations', 'Uncovered H3 cells inside the city; candidate sites'],
], { size: 16 }));
C.push(...table([22, 78], ['Scope item', 'Decision'], [
  ['Geography', 'Odisha (primary, 30 districts); Karnataka (benchmark, 31 districts); method designed for all states'],
  ['Units', 'District (reporting, LGD code) · H3 hexagons (res 8 urban ≈ 0.74 km², res 7 rural) · National Highway segments'],
  ['Segments', '2W; 3W e-auto/L5; 3W e-rickshaw (flagged separately); cars (4W). Buses: depot context layer only'],
  ['Charger classes', 'Light (<30 kW: AC + LEV DC) · DC (≥30 kW) · battery swap (separate layer)'],
  ['Time', 'Base year FY 2025-26; forecast FY 2029-30 (national 30% EV-sales goal); milestone FY 2027-28 (PM E-DRIVE end)'],
  ['Out of scope', 'Home/captive chargers, tariffs, real-time availability, feeder-level power flow, land permits'],
], { size: 16, boldFirst: true }));
C.push(...figure('report/figures/c4_journeys.png', 14, 'User journeys on the planned dashboard (Round 2).', 'Team design (Phase 4).'));

// ---------- 4 Data strategy ----------
C.push(H1('4. Data strategy'));
C.push(...table([17, 27, 21, 16, 19], ['Layer', 'Primary source', 'Fallback', 'Granularity', 'Licence / access'], [
  ['EV registrations', 'VAHAN 4 dashboard, FY 2017-18 to FY 2025-26 [1]', 'IndiaDataPortal VAHAN mirror', 'RTO × class × FY', 'Govt open data; read in browser'],
  ['RTO → district', 'Official VAHAN office list (39 Odisha offices)', 'State RTO lists', 'RTO', 'Built by team'],
  ['Public chargers', 'OpenChargeMap export (22 Apr 2026) + OSM [2][3]', 'Operator locators; EV Yatra spot-check', 'Point (kW, points)', 'Provider licences; ODbL'],
  ['Official counts', 'MHI / Parliament annexures [6][7]', 'BEE releases [9]', 'State', 'Public'],
  ['Boundaries', 'OSM admin_level 5 + LGD codes [3][26]', 'Survey of India; DataMeet', 'District polygon', 'ODbL'],
  ['Roads / NH, grid', 'OSM (Overpass, Geofabrik) [3]', 'NHAI toll list; OPTCL', 'Line / point', 'ODbL'],
  ['Population, activity', 'WorldPop 2020 (1 km); GHSL; VIIRS [4][25]', 'Census 2011 + projections', 'Raster → H3', 'CC BY 4.0'],
], { size: 15 }));
C.push(...table([34, 22, 22, 22], ['Completeness of open charger data (Done)', 'Our sites', 'Official stations', 'Completeness'], [
  ['Odisha (OCM 239 + OSM 2 records; 3 duplicates and 9 closed removed)', '229', '606 (unverified) [8]', '**38%**'],
  ['Karnataka', '415', '6,805 [6]', '**6%**'],
], { size: 16 }));
C.push(B('**Better access than expected.** With Y-axis = Rto, X-axis = Vehicle Class and fuel = ELECTRIC(BOV) + PURE EV, VAHAN returns a whole state in **one query per financial year**. Checks pass: segment sums equal VAHAN totals, and Karnataka FY 2024-25 (174,003) matches the 1.73 lakh reported.'));
C.push(B('**Synthetic and assumed data** is limited to cell-level EV allocation, swap-station capacity, and planning parameters with no Indian data. Every such value carries an is_synthetic or is_assumed flag (Appendix A2) and is stress-tested in scenarios.'));

// ---------- 5 Approach ----------
C.push(H1('5. Approach overview'));
C.push(...figure('report/figures/c1_pipeline.png', 16.5, 'End-to-end pipeline: 10 stages from public sources to planning outputs.', 'Team design (Phase 4).'));
C.push(...table([8, 30, 62], ['#', 'Stage', 'Status'], [
  ['1-4', 'Ingest, clean/dedupe, spatial join, features', '**Done** for Odisha + Karnataka (prototype notebook, real data)'],
  ['5', 'Charging Gap Index', '**Done** (district) · Round 2: H3 cells'],
  ['6-7', 'Forecast; charger need', '**Done** (state → district, 3 scenarios, backtest) · Round 2: corridor rule for all NHs'],
  ['8', 'MCLP siting', 'Round 2'],
  ['9', 'Validation', '**Partly done** (backtest, norms, sensitivity) · Round 2: siting hold-out, PM E-DRIVE check'],
  ['10', 'API + dashboard', 'Round 2'],
], { size: 16 }));

// ---------- 6 Data integration ----------
C.push(H1('6. Data integration'));
C.push(B('**Demand mapping:** EV[d,s,t] = Σ_r w[r,d] · REG[r,s,t]. In Odisha all 38 offices with EV records map one-to-one to a district (w = 1); for example, OD-35 Talcher maps to Angul. Offices covering several districts are split by population share and flagged. State-level offices are allocated by each district\'s share of EVs.'));
C.push(B('**Stock with attrition:** STOCK[d,s,T] = Σ_t EV[d,s,t] · (1 − a_s)^(T−t). Annual attrition a: 2W 2%, e-auto 2%, e-rickshaw 10%, 4W 0%.'));
C.push(B('**Charger merge:** OCM + OSM (+ operator data in Round 2) go into one schema. **De-duplication** (union-find) merges records that are ≤50 m apart with the same operator, or ≤15 m apart with the same kW class. The most complete record is kept and every source ID is stored.'));
C.push(B('**Classification and filters:** light if max kW <30, DC if ≥30. If kW is missing, DC is assumed for a DC connector or a DC-heavy operator (flagged; 36 Odisha records). Private/captive and non-operational records are dropped.'));
C.push(B('**Cell-level demand (Round 2):** EV[h] = EV[d] · pop_h · NTL_h^0.5 / Σ(pop · NTL^0.5), using WorldPop population × VIIRS night-lights; flagged as synthetic.'));
C.push(B('**Versioning:** every run carries a snapshot ID. Raw files are immutable; processed tables are append-only; the dashboard shows the data date. Refresh: VAHAN monthly, OCM/OSM weekly, MHI per Parliament session.'));

// ---------- 7 Gap Index ----------
C.push(H1('7. Gap assessment: Charging Gap Index'));
C.push(...table([18, 52, 10, 20], ['Component', 'Definition', 'Weight', 'Rationale'], [
  ['Load', 'ln(1 + EV stock / (observed charge points + 1))', '40%', "Pressure on today's network"],
  ['Access', '% of population > 5 km from any public charger (1 km for urban cells)', '35%', 'Equity: who cannot reach a charger'],
  ['Momentum', 'FY 2023-24 → FY 2025-26 registration CAGR (capped at 95th percentile)', '25%', 'Where demand is accelerating'],
], { size: 16 }));
C.push(P('Gap Index = Σ w_k · 100 · (x_k − min) / (max − min), on a 0-100 scale where higher means more underserved. **Done** for 30 Odisha districts (Figure 4).'));
C.push(...figure('outputs/figures/odisha_gap_map.png', 13.5, 'Draft Charging Gap Index by district, Odisha, with public chargers and NH-16.', 'VAHAN 4 [1]; OpenChargeMap export + OSM, de-duplicated [2][3]; OSM districts; WorldPop 2020 [4]. Team analysis.'));
C.push(...table([7, 17, 9, 11, 10, 10, 15, 11, 10], ['Rank', 'District', 'Index', 'EVs FY26', 'Mapped points', 'EVs / point', 'Pop. > 5 km', 'CAGR FY24-26', 'FY30 gap (Base)'], [
  ['1', 'Balangir', '82.5', '6,004', '1', '6,004', '98%', '18%', '50'],
  ['2', 'Dhenkanal', '80.6', '3,549', '2', '1,774', '89%', '90%', '26'],
  ['3', 'Kendrapara', '79.2', '3,547', '1', '3,547', '97%', '38%', '81'],
  ['4', 'Mayurbhanj', '77.2', '11,417', '5', '2,283', '92%', '40%', '114'],
  ['5', 'Bhadrak', '74.7', '6,471', '6', '1,079', '85%', '90%', '64'],
  ['6', 'Rayagada', '74.5', '1,672', '2', '836', '99%', '79%', '7'],
  ['7', 'Angul', '74.3', '6,849', '7', '978', '87%', '86%', '76'],
  ['8', 'Bargarh', '73.1', '5,654', '4', '1,413', '95%', '43%', '50'],
  ['9', 'Nabarangapur', '72.5', '1,322', '2', '661', '97%', '90%', '13'],
  ['10', 'Kalahandi', '70.1', '2,189', '2', '1,095', '95%', '56%', '24'],
], { size: 15 }));
C.push(P('**Weight sensitivity (Done).** We ran 12 weight variants plus a capped-momentum check; results are below.', { after: 30 }));
C.push(...table([46, 18, 18, 18], ['Variant', 'Spearman ρ vs Base', 'Top-10 overlap', 'Max rank change'], [
  ['Equal weights 33/33/33', '0.975', '10/10', '4'],
  ['Six ±10-point shifts (min to max)', '0.951 to 0.977', '8 to 10/10', '4 to 6'],
  ['PCA first-component weights (0.46 / 0.40 / 0.13)', '0.968', '9/10', '6'],
  ['Leave one out (load / access / momentum)', '0.754 / 0.828 / 0.882', '8 / 7 / 7', '17 / 13 / 8'],
  ['Momentum capped at 95th percentile', '1.000', '10/10', '0'],
], { size: 16 }));
C.push(B('**Result.** Every weighting variant passes our rule (ρ ≥ 0.85 and ≥ 8 of 10 districts shared), so the ranking is robust to the choice of weights. Leave-one-out tests move ranks most, which shows each component adds information.'));
C.push(B('**Incomplete charger data.** We publish GI_obs and GI_scaled (points ÷ completeness). Maximum rank change is 5, only for Gajapati (no mapped charger). Uniform scaling cannot reveal where the missing chargers are, so Access from observed chargers is an **upper bound on underservice**. Each district carries a data-confidence flag.'));
C.push(B('**Note:** the separate ±30% test in Section 10 is on FY30 charge-point gaps, not on this index.'));

// ---------- 8 Norm compliance ----------
C.push(H1('8. Norm compliance (Done)'));
C.push(...table([30, 36, 34], ['Norm (MoP, 17 Sep 2024)', 'Measurement', 'Result'], [
  ['≥1 public station per 1×1 km urban grid by FY 2030', 'Bhubaneswar Municipal Corporation (146.9 km²) split into 183 H3 res-8 cells; share of cells with a charger ≤1 km away', '**24.6%** of cells covered; 19 stations vs ~147 implied; median distance 1.6 km'],
  ['A station every 20 km on both sides of highways', 'NH-16 in Odisha (437 km OSM centreline); gaps between chargers within 2 km of the road', '**6 gaps > 20 km** (max 49.4 km); 96 chargers near the corridor'],
  ['Fast charging for long-range / heavy vehicles', 'Same corridor, DC chargers only', '**7 gaps > 20 km** (max 78.4 km); 24 DC chargers'],
], { size: 16 }));
C.push(P('__NH-16 length is from OSM and is shorter than the official length (≈480 km+), so the gap counts are lower bounds.__', { size: 16, color: '444444' }));

// ---------- 9 Forecast ----------
C.push(H1('9. Demand forecast'));
C.push(B('**Model:** Holt damped additive trend per segment on Odisha annual registrations, FY 2019-20 to FY 2025-26: ŷ(t+h) = ℓ_t + (φ + … + φ^h)·b_t. Damping reflects an adoption curve that is levelling off. Parameters are interpretable; seven annual points do not justify ML models.'));
C.push(...table([34, 22, 22, 22], ['Backtest: train FY20-FY24, test FY25-FY26 (Done)', 'Holt damped MAPE', 'Log-linear MAPE', 'Decision'], [
  ['2W / 4W', '6.2% / 16.9%', '488% / 1,276%', 'Holt'],
  ['3W e-auto / e-rickshaw', '48.4% / 45.8%', '334% / 172%', 'Holt, ±50% band'],
  ['**All (weighted by volume)**', '**10.2%**', '**507%**', '**Holt adopted**'],
], { size: 16 }));
C.push(...table([14, 58, 28], ['Scenario', 'Definition', 'EV stock FY 2029-30 (2W/3W/4W)'], [
  ['Low', 'FY24→FY26 CAGR g₀; growth in year t = g₀ · 0.5^t', '6.8 lakh'],
  ['Base', 'Holt damped trend', '**8.3 lakh**'],
  ['High', 'EV share of new registrations rises linearly to 50% by FY30 (draft Odisha EV Policy 2025, not yet notified); segment markets held at FY26 level', '14.4 lakh'],
], { size: 16 }));
C.push(B('FY 2025-26 stock is 2.47 lakh. The weak 3W forecast matters little because 3W is under 10% of public energy (Base). District allocation now uses each district\'s FY26 share; Round 2 adds a hierarchical district model reconciled to the state total.'));

// ---------- 10 Charger requirement ----------
C.push(H1('10. Charger requirement'));
C.push(...box([
  mono('E_pub[d] = Σ_s  STOCK[d,s] × km_s × (Wh/km)_s / 1000 × share_s          (kWh/day)'),
  mono('N_light  = E_light / (7.4 kW × 6 h)        N_DC,energy = E_DC / (60 kW × 4 h)'),
  mono('N_DC,corridor = Σ_NH ⌈ L_NH / 20 km ⌉ × 2 sides      (+ ⌈L/100⌉ × 2 heavy-duty)'),
  mono('N_DC = max(N_DC,energy , N_DC,corridor)     Gap = max(0, N − existing_scaled)'),
], GREY));
C.push(...table([22, 13, 13, 13, 13, 26], ['Parameter', '2W', 'e-auto', 'e-rickshaw', '4W', 'Source'], [
  ['km/day', '25', '100', '70', '35*', 'Ather, CSTEP, WRI [20][16]'],
  ['Wh/km', '33', '60', '77', '123', 'LBNL, WRI [15][16]'],
  ['Public-charging share', '10%', '30%*', '2.5%*', '20%*', 'Kazam-AEEE, IRADe [17][18]'],
  ['Share at DC', '0', '0', '0', '60%*', 'Assumed'],
], { size: 16 }));
C.push(P('__* = assumed (no Indian data); stress-tested ±30%. Charger: light 7.4 kW × 6 h/day, DC 60 kW × 4 h/day (planning targets, assumed).__', { size: 15, color: '444444' }));
C.push(...table([34, 66], ['Worked example: Baleshwar, Base FY 2029-30', 'Value'], [
  ['EV stock FY26 → FY30', '2W 14,225 → 48,493 · e-auto 1,315 → 3,892 · e-rickshaw 2,770 → 4,481 · 4W 397 → 2,019'],
  ['Public energy', '4,001 + 7,005 + 604 + 1,738 = **13,348 kWh/day**'],
  ['Light points needed', '12,305 ÷ (7.4 × 6) = **277**'],
  ['DC: energy vs corridor', 'energy 1,043 ÷ (60 × 4) = 4.3 · corridor: NH-16 ≈116 km in district → ⌈116/20⌉ × 2 = 12'],
  ['**DC need = max(4.3, 12)**', '**12 DC sites**'],
  ['Existing (scaled to official count)', 'light ≈ 32 · DC ≈ 11 (12 and 4 mapped ÷ 0.38)'],
  ['Gap', '**Light ≈ 245**. DC ≈ 1 by count, but the **location gap** remains: NH-16 has stretches of up to 49 km with no charger'],
], { size: 16 }));
C.push(...figure('outputs/figures/ev_vs_chargers_chart.png', 12.5, 'Odisha public charge points: today (observed, and scaled to the official count) vs FY 2029-30 need by scenario.', 'Team analysis; parameters as in the table above; EV stock from VAHAN 4 [1].'));
C.push(B('**State level (Base):** 2,822 light + 115 DC (energy-based) are needed, against about 553 + 188 existing (scaled). NH-16 alone needs ⌈437/20⌉ × 2 = **44 DC sites**, so in Odisha **the corridor rule drives DC need**.'));
C.push(B('**Sensitivity (Done):** ±30% on public-charging share or utilisation keeps **9-10 of the top-10 gap districts** unchanged (total gap 1,468 to 3,536 points).'));
C.push(...figure('report/figures/c3_logic.png', 14, 'Logic of the Gap Index and the charger requirement, feeding siting.', 'Team design (Phase 4).'));

// ---------- 11 Siting ----------
C.push(H1('11. Siting (Round 2): Maximal Covering Location Problem'));
C.push(...box([
  '**Sets:** I = demand cells (H3); J = candidate cells (road access + fuel station, mall, car park, government office, transit hub, PM E-DRIVE site).',
  '**Coverage:** N_i = { j : dist(i, j) ≤ R }, with R = 1 km urban, 5 km rural, 20 km corridor.',
  '**Variables:** x_j ∈ {0,1} (open a station at j); y_i ∈ {0,1} (cell i covered).',
  mono('maximise   Σ_i w_i · y_i  −  λ · Σ_j g_j · x_j'),
  mono('s.t.       y_i ≤ Σ_{j∈N_i} x_j      Σ_j x_j ≤ N      x_j = 1 for existing sites'),
  '**Inputs:** w_i = unmet public kWh/day (Section 10). g_j = distance to the nearest substation (grid penalty), or a hard limit of 5 km. N = budget, e.g. Odisha\'s 170 PM E-DRIVE stations. Corridor sites use a 1-D greedy with a maximum spacing of 20 km.',
  '**Solver:** PuLP + CBC with a 5-minute limit (~10⁴ cells). **Greedy fallback** adds the site with the largest marginal coverage; it is guaranteed to reach at least 63% of the optimum.',
], LIGHT, 17));
C.push(B('**Why MCLP:** it answers the planner\'s question ("best N sites for this budget") and maps directly to the MoP coverage norms. **p-median** needs origin-destination trip data, which is not available. **TOPSIS** has no budget or coverage logic and uses subjective weights, so it is kept only as a tie-breaker.'));

// ---------- 12 Validation ----------
C.push(H1('12. Validation'));
C.push(...table([20, 44, 36], ['Test', 'Design', 'Status / pass rule'], [
  ['(a) Forecast backtest', 'Rolling origin: FY20-24 → FY25-26; FY20-23 → FY24-25', '**Done:** MAPE 10.2% (pass < 20%)'],
  ['(b) Norm compliance', 'Urban 1 km on H3 res 8; NH gaps > 20 km', '**Done:** Bhubaneswar 24.6%; NH-16: 6 gaps; reported as measurement'],
  ['(c) Siting hold-out', 'Hide 30% of existing chargers, rerun MCLP, measure share recovered within 1/5 km (20 runs)', 'Round 2. A **demand-model sanity check**, not accuracy: existing chargers are city-biased, while our index targets equity. Pass: ≥ 2× random placement'],
  ['(d) Index sanity', 'Overlap of top-quartile districts/cells with PM E-DRIVE (Odisha 170 approved in 6 cities) and state SOP sites', 'Round 2. Low rural overlap is expected and reported, not tuned away'],
  ['(e) Sensitivity', 'One-at-a-time ±30% on each assumed parameter; Low/Base/High; weight variants', '**Done** for share, utilisation and weights; Round 2: tornado chart'],
], { size: 16 }));

// ---------- 13 Architecture ----------
C.push(H1('13. Architecture and tech stack'));
C.push(...figure('report/figures/c2_architecture.png', 11.5, 'System architecture. Solid = built in Round 2 on a laptop; dashed = future scale-up.', 'Team design (Phase 4).'));
C.push(...table([18, 34, 48], ['Layer', 'Tool (free / open source)', 'Why / alternative'], [
  ['Data', 'PostgreSQL + PostGIS (+ h3-pg); versioned raw files', 'Spatial SQL that scales nationally / DuckDB-spatial'],
  ['Processing', 'Python: pandas, geopandas, h3, rasterio', 'Same code as the working prototype / polars'],
  ['Models', 'statsmodels (Holt); PuLP + CBC', 'Interpretable, backtested; free MILP solver / OR-Tools'],
  ['API', 'FastAPI (REST + GeoJSON)', 'Typed, auto-documented / Flask'],
  ['Frontend', 'React + Leaflet, Recharts; OSM / MapLibre basemap', 'Light, works offline / Streamlit fallback'],
  ['Ops', 'Git/GitHub, Docker Compose, cron / GitHub Actions', 'One-command demo; reproducible refresh'],
], { size: 16 }));

// ---------- 14 Roadmap ----------
C.push(H1('14. Implementation roadmap (7 Nov to 16 Dec 2026)'));
C.push(...table([9, 13, 37, 23, 8, 10], ['Week', 'Dates', 'Tasks', 'Output', 'Deliv.', 'Risk'], [
  ['W1', '7-13 Nov', 'Data hardening: MHI annexure, operator locators, EV Yatra spot-check, VAHAN reconciliation; PostGIS schema; refresh scripts', 'Verified charger census; versioned database', 'D3 base', 'Operator data blocked'],
  ['W2', '14-20 Nov', 'Gap Index final (H3 + district); hierarchical forecast; charger-need module with DC = max rule for all NHs', 'Need tables by scenario', 'D4', '3W forecast error'],
  ['W3', '21-27 Nov', 'MCLP siting + substation layer; validation suite (hold-out, PM E-DRIVE overlap, tornado)', 'Ranked sites; validation report', 'D2, D4', 'Solver time'],
  ['W4', '28 Nov-4 Dec', 'FastAPI endpoints; React + Leaflet map; dashboard with scenario switches and downloads', 'Working web platform', 'D1, D2, D5', 'Front-end slip'],
  ['W5', '5-11 Dec', 'Karnataka run (scalability test); final methodology document; scalability roadmap', 'Two-state platform; documents', 'D3, D7', 'Karnataka data gaps'],
  ['W6', '12-15 Dec', 'Demo video; buffer; rehearsal; finale 16-18 Dec', 'Video; final deck', 'D6', 'None (buffer)'],
], { size: 15 }));
C.push(...table([10, 45, 45], ['Week', 'Go / no-go milestone', 'Fallback if missed'], [
  ['W1', 'Charger census ≥ 60% of official Odisha count; VAHAN gap explained', 'Keep completeness scaling + confidence flags'],
  ['W2', 'Need module reproduces Phase 3 totals; H3 index computed', 'District-only index'],
  ['W3', 'MCLP solves Odisha in < 5 min', 'Greedy siting (≥ 63% of optimum)'],
  ['W4', 'Map + 3 dashboard views live on laptop', 'Streamlit dashboard'],
  ['W5', 'Karnataka pipeline runs without code changes', 'State-level Karnataka benchmark only'],
  ['W6', 'Demo video recorded', 'Live demo script only'],
], { size: 16 }));
C.push(...table([40, 10, 10, 10, 10, 10, 10], ['Workstream', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6'], [
  ['Data hardening and database', '', '', '', '', '', ''],
  ['Gap Index, forecast, need (D4)', '', '', '', '', '', ''],
  ['Siting and validation', '', '', '', '', '', ''],
  ['Web platform, map, dashboard (D1, D2, D5)', '', '', '', '', '', ''],
  ['Karnataka run, documents (D3, D7)', '', '', '', '', '', ''],
  ['Demo video (D6), rehearsal', '', '', '', '', '', ''],
], { size: 16, hl: (r, i) => ([[1], [2, 3], [3], [4, 5], [5], [6]][r].includes(i) ? '9DC3E6' : undefined) }));

// ---------- 15 Assumptions ----------
C.push(H1('15. Assumptions, risks and mitigations'));
C.push(...table([22, 18, 30, 30], ['Item', 'Value used', 'Stress test', 'Round 2 fix'], [
  ['Charger completeness', 'Odisha 38%, Karnataka 6%', 'GI_obs vs GI_scaled (max rank change 5); missing chargers may cluster in cities, so Access is an upper bound', 'Operator locators; EV Yatra; MHI annexure'],
  ['Odisha official count', '606 stations (unverified)', 'Headline 1 shown with ±20% band', 'Download MHI / Parliament annexure'],
  ['VAHAN stock vs state figure', '1.64 lakh registrations to FY25 vs 2.19 lakh reported (≈25% lower)', 'High-stock variant (×1.25)', 'Reconcile with Odisha Transport Dept.'],
  ['4W public-charging share', '20% (range 10-35%)', '±30%: top-10 gap districts 9-10/10 stable', 'Operator session data'],
  ['4W share at DC', '60%', '40-80%', 'Charge-point operator data'],
  ['Utilisation hours', 'Light 6 h, DC 4 h', '±30%; 2-8 h range', 'Calibrate to observed 1-5% utilisation'],
  ['Access threshold', '5 km rural, 1 km urban', '3 / 5 / 10 km', 'Travel-time isochrones'],
  ['High scenario', '50% EV share by FY30 (draft policy)', 'Reported as an upper bound, not a forecast', 'Update when policy is notified'],
], { size: 15 }));

// ---------- 16 Innovation & scalability ----------
C.push(H1('16. Innovation and scalability'));
C.push(...table([34, 66], ['Novel element', 'Gap it fills in existing platforms'], [
  ['VAHAN-linked demand by segment (RTO → district → H3)', 'EV Yatra, OCM and operator apps show supply only; none links chargers to the registered EV fleet'],
  ['Norm-compliance measurement (1 km urban; 20 km corridor)', 'MoP 2024 norms exist but no tool measures them; we report Bhubaneswar 24.6% and 6 NH-16 gaps'],
  ['DC need = max(energy, corridor)', 'Energy-only estimates understate highway DC where cars are few (Odisha: 115 energy-based vs 44 sites on NH-16 alone)'],
  ['Grid-aware MCLP with a PM E-DRIVE budget', 'Academic siting is single-city and ignores grid capacity; ours is budgeted, grid-aware and reproducible'],
  ['Transparent scenarios and completeness flags', 'Official counts differ by up to 2×; every figure here has a source, snapshot date and assumption flag'],
], { size: 16 }));
C.push(...table([18, 42, 40], ['Stage', 'Scope', 'Enabler'], [
  ['Pilot (Round 2)', 'Odisha: district + H3, all modules', 'Working prototype; open data'],
  ['Benchmark', 'Karnataka with the same code', 'One VAHAN query per state per year'],
  ['National', 'All 36 states/UTs', 'PostGIS + scheduled refresh; LGD-keyed districts'],
  ['Live', 'Monthly VAHAN, live operator feeds, PM E-DRIVE tracking', 'OCPI / EV Yatra integration; NIC hosting'],
], { size: 16 }));

// ---------- Appendices ----------
C.push(BR());
C.push(H1('A1. Appendix: Sources'));
const SRC = [
  'VAHAN 4 Dashboard, MoRTH. https://vahan.parivahan.gov.in/vahan4dashboard/ (read 17 Oct 2026)',
  'OpenChargeMap per-site export (snapshot 22 Apr 2026). https://github.com/openchargemap/ocm-export',
  'OpenStreetMap contributors (ODbL), via Overpass API and Geofabrik. https://www.openstreetmap.org',
  'WorldPop 2020, India 1 km UN-adjusted (CC BY 4.0). https://hub.worldpop.org',
  'Ministry of Power, Guidelines and Standards for EV Charging Infrastructure, 17 Sep 2024 (as reported by Business Standard, ORF). https://www.business-standard.com/industry/auto/govt-issues-revised-guidelines-for-electric-vehicle-charging-stations-124091900970_1.html',
  'MHI reply, Rajya Sabha, 7 Aug 2026 (as reported). https://electricalmirror.net/karnataka-ranks-second-in-india-with-6805-ev-charging-stations/',
  'MHI, Status and Expansion of EV Charging Infrastructure, 27 Mar 2026; Mercom India. https://mercomindia.com/oil-firms-install-27737-ev-chargers-between-fy-2021-fy-2026',
  'MHI state table, Dec 2025 (via India Data Report; unverified). https://indiadatareport.com/state-wise-ev-charging-stations-india/',
  'BEE Karnataka count, Aug 2024 (GKToday). https://www.gktoday.in/karnataka-leads-nation-with-5765-public-ev-charging-stations/',
  'PM E-DRIVE operational guidelines, 72,300 PCS (Free Press Journal). https://www.freepressjournal.in/amp/business/pm-e-drive-scheme-centre-issues-operational-guidelines-for-deployment-of-72300-public-ev-charging-stations-with-2000-crore-outlay',
  'Odisha PM E-DRIVE approval, 170 PCS (BioEnergy Times). https://bioenergytimes.com/odisha-gets-rs-40-50-crore-under-pm-e-drive-scheme-for-ev-charging-network/',
  'Draft Odisha EV Policy 2025, Commerce & Transport Dept. https://ct.odisha.gov.in/sites/default/files/2025-09/Draft-Odisha%20EV%20Policy,2025.pdf',
  'Odisha EV Policy 2021 extension to 31 Dec 2026 (OMMCOM News). https://ommcomnews.com/odisha-news/odisha-extends-electric-vehicle-policy-till-december-31-2026/',
  'NITI Aayog, NITI Sandhan newsletter Oct 2025 (30% EV sales by 2030). https://www.niti.gov.in/sites/default/files/2025-10/Newsletter-NITI-SandhanOct-25.pdf',
  'LBNL, Electrical consumption of 2-, 3- and 4-wheel EVs in India. https://emp.lbl.gov/publications/electrical-consumption-two-three-and',
  'WRI India, economics of electric three-wheelers. https://wri-india.org/blog/busting-cost-barrier-why-electric-three-wheelers-make-business-sense',
  'Kazam & AEEE, residential EV charging report (EVreporter). https://evreporter.com/kazam-and-aeee-launch-report-on-residential-ev-charging-in-india/',
  'IRADe, Delhi EV survey and grid impact. https://irade.org/wp-content/uploads/2025/08/IRN-DelhiEVsurveyImpactonGridPaper-1.pdf',
  'Bolt.Earth charging-session data (Autocar Pro). https://www.autocarpro.in/news/2w-drive-78-percent-of-ev-charging-sessions-pvs-draw-67-percent-power-boltearth-134608',
  'Ather user km, 2024 (Autocar Pro). https://autocarpro.in/news/ather-reports-239-billion-kilometres-covered-by-its-ev-users-in-2024-124671',
  'IEA, Global EV Outlook 2026: EV charging. https://www.iea.org/reports/global-ev-outlook-2026/electric-vehicle-charging-chap-6-and-10',
  'EU AFIR progress (Electrive). https://electrive.com/2026/07/20/only-one-eu-country-misses-afir-charging-target',
  'Battery Smart daily swaps (Autocar Pro). https://autocarpro.in/news/battery-smart-achieves-1-lakh-daily-swaps-on-its-ev-battery-swapping-network-121925',
  'Down To Earth, VAHAN data quality. https://www.downtoearth.org.in/air/driving-on-broken-data-why-indias-clean-air-and-ev-push-cannot-outrun-vahans-cracks',
  'GHSL (JRC) https://ghsl.jrc.ec.europa.eu ; VIIRS night-lights (EOG) https://eogdata.mines.edu/products/vnl/',
  'Local Government Directory (LGD codes). https://lgdirectory.gov.in',
  'Odisha EV count, Economic Survey 2025-26 (OdishaBytes). https://odishabytes.com/over-2-19-lakh-evs-on-roads-in-odisha-with-12-charging-stations-in-bhubaneswar/',
];
SRC.forEach((s, i) => C.push(new Paragraph({ children: runs(`[${i + 1}] ${s}`, { size: 15 }), spacing: { after: 30 } })));
C.push(P('__Web sources accessed 17 Oct 2026. Data licences: VAHAN (Government open data); OSM (ODbL); OpenChargeMap (per data provider); WorldPop, GHSL, VIIRS (CC BY 4.0).__', { size: 15, color: '444444', before: 60 }));

C.push(H1('A2. Appendix: Synthetic and assumed data register'));
C.push(...table([30, 40, 30], ['Item', 'How it is modelled', 'Label in data'], [
  ['RTO split for multi-district offices', 'Population share of jurisdiction (none needed in Odisha; Chandikhole mapping to be confirmed)', 'is_assumed'],
  ['Cell-level EV demand (H3)', 'District EVs × population × night-lights^0.5', 'is_synthetic'],
  ['Charger kW class when missing', 'DC connector / operator rule (36 Odisha records)', 'is_kw_imputed'],
  ['Charge points per site when missing', 'Median by class (1 point)', 'is_points_imputed'],
  ['Existing chargers scaled to official count', 'Observed ÷ completeness (0.38 Odisha)', 'is_assumed'],
  ['Planning parameters without Indian data', '4W km/day; 3W/4W public share; DC share; utilisation; charger kW; attrition', 'is_assumed (parameter table)'],
  ['District allocation of FY30 forecast', 'FY26 district share per segment', 'is_assumed'],
  ['Battery-swap capacity', '90 swaps/day × 2 kWh (press-release estimates) [23]', 'is_synthetic'],
], { size: 16 }));

C.push(H1('A3. Appendix: AI-tool disclosure'));
C.push(B('**Claude (Anthropic)** was used for research synthesis (finding and summarising public sources), code assistance (data-processing notebook and diagram rendering) and drafting this document.'));
C.push(B('All numbers were computed by our code from the cited data. The notebook, raw data snapshots and data-quality log are kept for audit. All figures and decisions were reviewed by the team.'));
C.push(B('No proprietary or confidential data was used. Third-party open-source libraries: pandas, geopandas, h3, rasterio, statsmodels, scipy, matplotlib, Mermaid, docx.'));

// ---------- document ----------
const doc = new Document({
  creator: 'Team TM-72BD3802D52', title: 'EV Infra Map India: Round 1 submission',
  styles: {
    default: { document: { run: { font: FONT, size: 19 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, font: FONT, color: BLUE }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 21, bold: true, font: FONT, color: '333333' }, paragraph: { spacing: { before: 140, after: 60 }, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } },
                                 { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 240 } } } }] },
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] },
  ] },
  sections: [{
    properties: { titlePage: true, page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 1000, left: 1077, right: 1077, header: 500, footer: 500 } } },
    headers: {
      first: new Header({ children: [new Paragraph({ children: [] })] }),
      default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'B7C4D1', space: 2 } },
        tabStops: [{ type: TabStopType.RIGHT, position: W }],
        children: [new TextRun({ text: 'EV Infra Map India  ·  Round 1 submission', font: FONT, size: 15, color: '555555' }),
          new TextRun({ children: [new Tab(), 'Team ID: TM-72BD3802D52'], font: FONT, size: 15, color: '555555' })] })] }),
    },
    footers: {
      first: new Footer({ children: [new Paragraph({ children: [] })] }),
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], font: FONT, size: 15, color: '555555' })] })] }),
    },
    children: C,
  }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(path.join(__dirname, 'Final_Round1_Submission.docx'), b); console.log('docx written'); });
