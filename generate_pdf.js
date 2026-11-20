const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, 'campus_floor_plans.html');
const sourceHtml = fs.readFileSync(htmlPath, 'utf8');

// Extract campusBuildings JavaScript array
const startMarker = 'const campusBuildings = [';
const endMarker = 'let currentBuildingIndex = 0;';

const startIndex = sourceHtml.indexOf(startMarker);
const endIndex = sourceHtml.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find campusBuildings in campus_floor_plans.html');
  process.exit(1);
}

const jsCode = sourceHtml.substring(startIndex, endIndex);
// Execute in context to get array
const campusBuildings = eval(`(() => { ${jsCode} return campusBuildings; })()`);
console.log(`Extracted ${campusBuildings.length} buildings.`);

// Generate the complete PDF printable HTML dossier
let sheetsHtml = '';
let sheetNum = 101;

// 1. Cover Sheet
sheetsHtml += `
  <div class="sheet cover-sheet">
    <div class="cover-inner">
      <div class="cover-badge">ARCHITECTURAL DESIGN DOSSIER • LEVEL 2D CAD BLUEPRINTS</div>
      <h1 class="cover-title">4.5-ACRE INSTITUTIONAL CAMPUS</h1>
      <h2 class="cover-subtitle">GIRLS CONSOLIDATED ACADEMIC (+1/+2) & HOSTEL ENCLAVE, GENERAL CBSE SCHOOL, KINDERGARTEN & SPORTS CENTROID</h2>

      <div class="cover-stats-grid">
        <div class="cover-stat">
          <div class="c-val">4.50 Acres</div>
          <div class="c-lbl">Site Land Area (18,211 m²)</div>
        </div>
        <div class="cover-stat">
          <div class="c-val">4,475</div>
          <div class="c-lbl">Peak Occupant Load (IBC Table 1004.5)</div>
        </div>
        <div class="cover-stat">
          <div class="c-val">960 Students</div>
          <div class="c-lbl">Girls Senior Wing (+1 & +2: 16 CR × 60)</div>
        </div>
        <div class="cover-stat">
          <div class="c-val">3 Gates</div>
          <div class="c-lbl">Strictly Segregated Circulation Gates</div>
        </div>
      </div>

      <div class="cover-index">
        <div class="cover-index-title">DRAWING SHEET INDEX</div>
        <table class="index-table">
          <thead>
            <tr><th>Sheet No.</th><th>Drawing Title</th><th>Building Wing</th><th>Target Occupancy</th></tr>
          </thead>
          <tbody>
`;

// Calculate sheets list
const allSheets = [];
campusBuildings.forEach((b) => {
  b.floors.forEach((f, fIdx) => {
    allSheets.push({
      sheetId: `A-${sheetNum++}`,
      building: b,
      floor: f,
      floorIdx: fIdx
    });
  });
});

allSheets.forEach(s => {
  sheetsHtml += `
    <tr>
      <td class="sheet-code">${s.sheetId}</td>
      <td><strong>${s.building.name}</strong> — ${s.floor.name}</td>
      <td>${s.building.levels[s.floorIdx]}</td>
      <td>${s.floor.occ}</td>
    </tr>
  `;
});

sheetsHtml += `
          </tbody>
        </table>
      </div>

      <div class="cover-footer">
        <div><strong>Project:</strong> 4.5-Acre Institutional School Campus</div>
        <div><strong>Firm:</strong> Antigravity Architectural & Campus Planning Studio</div>
        <div><strong>Code Compliance:</strong> IBC 2024 Chapter 10 / NFPA 101 / National Building Code</div>
        <div><strong>Date:</strong> November 2026</div>
      </div>
    </div>
  </div>
`;

// 2. Blueprint Sheets for Every Floor
allSheets.forEach((s) => {
  sheetsHtml += `
    <div class="sheet blueprint-sheet">
      <div class="sheet-header">
        <div class="header-left">
          <div class="proj-name">4.5-ACRE INSTITUTIONAL SCHOOL CAMPUS MASTER PLAN</div>
          <div class="building-name">${s.building.name.toUpperCase()}</div>
        </div>
        <div class="header-right">
          <div class="sheet-title">${s.floor.name.toUpperCase()} BLUEPRINT</div>
          <div class="sheet-number-box">SHEET ${s.sheetId}</div>
        </div>
      </div>

      <div class="sheet-body">
        <div class="blueprint-canvas-container">
          <div class="cad-grid-lines"></div>
          <svg class="blueprint-svg" viewBox="0 0 1000 650">
            ${s.floor.svgContent}
          </svg>
        </div>

        <div class="sheet-sidebar">
          <div class="sidebar-box">
            <div class="side-title">FLOOR SPECIFICATIONS</div>
            <div class="side-stat"><span>Built-Up Area:</span><strong>${s.building.buaPerFloor}</strong></div>
            <div class="side-stat"><span>Floor Occupancy:</span><strong>${s.floor.occ}</strong></div>
            <div class="side-stat"><span>Clear Corridor:</span><strong>3.0 m (10'-0")</strong></div>
            <div class="side-stat"><span>Fire Egress Stairs:</span><strong>${s.floor.stairs}</strong></div>
            <div class="side-stat"><span>Sanitary Provision:</span><strong>${s.floor.wcs}</strong></div>
          </div>

          <div class="sidebar-box">
            <div class="side-title">ARCHITECTURAL PROGRAM & NOTES</div>
            <div class="side-notes">${s.floor.notes}</div>
          </div>

          <div class="sidebar-box legend-box">
            <div class="side-title">ROOM ZONING LEGEND</div>
            <div class="leg-item"><div class="leg-color" style="background:#0284c7;"></div><span>Classrooms</span></div>
            <div class="leg-item"><div class="leg-color" style="background:#0d9488;"></div><span>Labs / STEM Facilities</span></div>
            <div class="leg-item"><div class="leg-color" style="background:#6d28d9;"></div><span>Hostel Quad Dorms</span></div>
            <div class="leg-item"><div class="leg-color" style="background:#b45309;"></div><span>Dining / Multi-Hall</span></div>
            <div class="leg-item"><div class="leg-color" style="background:#475569;"></div><span>Staff / Administration</span></div>
            <div class="leg-item"><div class="leg-color" style="background:#be123c;"></div><span>Sanitary / Fire Cores</span></div>
            <div class="leg-item"><div class="leg-color" style="background:#15803d;"></div><span>Courtyard / Sports</span></div>
          </div>

          <div class="title-block-mini">
            <div class="tb-row"><span>Scale:</span> 1:200 Metric / CAD 2D</div>
            <div class="tb-row"><span>Status:</span> Master Plan Submission</div>
            <div class="tb-row"><span>Drawn:</span> Antigravity AI Studio</div>
            <div class="tb-row"><span>Sheet:</span> <strong>${s.sheetId}</strong></div>
          </div>
        </div>
      </div>

      <div class="sheet-footer">
        <div>NORTH ARROW: &#11014; NORTH (SPORTS PROMENADE)</div>
        <div>IBC 2024 TABLE 1004.5 COMPLIANT • ALL DIMENSIONS ARE IN MILLIMETERS UNLESS NOTED</div>
        <div>CONFIDENTIAL &bull; FOR CAMPUS SANCTION &amp; CONSTRUCTION PLANNING</div>
      </div>
    </div>
  `;
});

// Full Master HTML Template
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>4.5-Acre School Campus — Complete Architectural Floor Plans Dossier</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A3 landscape;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: #090d16;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }

    .sheet {
      width: 404mm;
      height: 281mm;
      margin: 0 auto 12mm;
      background: #0b1120;
      border: 2px solid #334155;
      padding: 8mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    }

    /* COVER SHEET STYLING */
    .cover-sheet {
      background: #070b14 radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.12) 0%, transparent 60%);
      border: 3px solid #38bdf8;
    }
    .cover-inner {
      height: 100%;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 16mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .cover-badge {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .cover-title {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -1px;
      color: #ffffff;
      margin-top: 6mm;
      line-height: 1.1;
    }
    .cover-subtitle {
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
      margin-top: 3mm;
      max-width: 320mm;
      line-height: 1.4;
    }
    .cover-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 8mm 0;
    }
    .cover-stat {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      padding: 14px 18px;
      border-radius: 8px;
    }
    .c-val {
      font-family: 'Space Mono', monospace;
      font-size: 20px;
      font-weight: 700;
      color: #38bdf8;
    }
    .c-lbl {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }
    .cover-index {
      flex: 1;
      overflow: hidden;
      margin: 4mm 0;
    }
    .cover-index-title {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #f8fafc;
      margin-bottom: 3mm;
      border-bottom: 2px solid #38bdf8;
      padding-bottom: 2mm;
    }
    .index-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .index-table th {
      text-align: left;
      padding: 6px 10px;
      background: #1e293b;
      color: #38bdf8;
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      text-transform: uppercase;
    }
    .index-table td {
      padding: 5px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .sheet-code {
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      color: #38bdf8;
    }
    .cover-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #334155;
      padding-top: 4mm;
      font-size: 10.5px;
      color: #64748b;
    }

    /* BLUEPRINT SHEET STYLING */
    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #38bdf8;
      padding-bottom: 4mm;
      margin-bottom: 4mm;
    }
    .header-left .proj-name {
      font-size: 10.5px;
      font-family: 'Space Mono', monospace;
      color: #94a3b8;
      letter-spacing: 1px;
    }
    .header-left .building-name {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.3px;
      margin-top: 1mm;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .sheet-title {
      font-size: 14px;
      font-weight: 700;
      color: #38bdf8;
    }
    .sheet-number-box {
      background: #0284c7;
      color: #ffffff;
      font-family: 'Space Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 4px;
      letter-spacing: 1px;
    }

    .sheet-body {
      display: flex;
      flex: 1;
      gap: 8mm;
      overflow: hidden;
    }

    .blueprint-canvas-container {
      flex: 1;
      background: #070d18;
      border: 1px solid #1e293b;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 4mm;
    }
    .cad-grid-lines {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: 
        linear-gradient(to right, rgba(56, 189, 248, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(56, 189, 248, 0.04) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
    }
    .blueprint-svg {
      width: 100%;
      height: 100%;
      max-height: 200mm;
      filter: drop-shadow(0 6px 18px rgba(0,0,0,0.7));
    }

    /* SVG CAD Styling */
    .wall-thick { stroke: #f8fafc; stroke-width: 4; fill: none; }
    .wall-interior { stroke: #94a3b8; stroke-width: 2; fill: none; }
    .door { stroke: #38bdf8; stroke-width: 1.5; fill: none; }
    .dimension-line { stroke: #38bdf8; stroke-width: 1; stroke-dasharray: 4,4; }
    .dimension-text { fill: #38bdf8; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; text-anchor: middle; }
    .room-zone { stroke-width: 1; opacity: 0.85; }
    .room-label { font-size: 11px; font-weight: 700; fill: #ffffff; text-anchor: middle; font-family: 'Plus Jakarta Sans', sans-serif; }
    .room-dim { font-size: 9.5px; fill: #cbd5e1; text-anchor: middle; font-family: 'Space Mono', monospace; }

    /* SIDEBAR DATA BOXES */
    .sheet-sidebar {
      width: 78mm;
      display: flex;
      flex-direction: column;
      gap: 3mm;
    }
    .sidebar-box {
      background: #0f172a;
      border: 1px solid #1e293b;
      padding: 10px 12px;
      border-radius: 6px;
    }
    .side-title {
      font-family: 'Space Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 3px;
    }
    .side-stat {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      padding: 2.5px 0;
      color: #94a3b8;
    }
    .side-stat strong {
      color: #f8fafc;
      font-weight: 600;
    }
    .side-notes {
      font-size: 9.5px;
      color: #cbd5e1;
      line-height: 1.45;
    }
    .legend-box .leg-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 9.5px;
      padding: 2px 0;
      color: #e2e8f0;
    }
    .leg-color {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .title-block-mini {
      background: #0284c7;
      color: #ffffff;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 9.5px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tb-row {
      display: flex;
      justify-content: space-between;
    }

    .sheet-footer {
      border-top: 1px solid #1e293b;
      padding-top: 2.5mm;
      margin-top: 3mm;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      font-family: 'Space Mono', monospace;
      color: #64748b;
    }
  </style>
</head>
<body>
  ${sheetsHtml}
</body>
</html>
`;

const dossierPath = path.join(__dirname, 'campus_floor_plans_dossier.html');
fs.writeFileSync(dossierPath, fullHtml, 'utf8');
console.log('Saved campus_floor_plans_dossier.html successfully.');
