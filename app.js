     // --- Tab switching ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.method-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const method = tab.dataset.method;
    document.getElementById('method-' + method).classList.add('active');
    document.getElementById('results').style.display = 'none';
  });
});

// --- Standard graft sizes ---
const GRAFT_SIZES = [
  { label: '2 x 2 cm', w: 2, h: 2, area: 4 },
  { label: '4 x 4 cm', w: 4, h: 4, area: 16 },
  { label: '5 x 5 cm', w: 5, h: 5, area: 25 },
  { label: '4 x 8 cm', w: 4, h: 8, area: 32 },
  { label: '5 x 10 cm', w: 5, h: 10, area: 50 },
  { label: '7 x 10 cm', w: 7, h: 10, area: 70 },
  { label: '8 x 12 cm', w: 8, h: 12, area: 96 },
  { label: '10 x 12 cm', w: 10, h: 12, area: 120 },
];

// --- Calculation functions ---

function calculateGrid() {
  const full = parseFloat(document.getElementById('grid-full').value);
  const partial = parseFloat(document.getElementById('grid-partial').value);
  const perimeter = parseFloat(document.getElementById('grid-perimeter').value) || 0;

  if (isNaN(full) || isNaN(partial)) {
    alert('Please enter the number of full and partial squares.');
    return;
  }

  const aConform = full + (partial * 0.5);
  const fixation = perimeter > 0 ? perimeter * 0.5 : 0;
  const total = aConform + fixation;

  showResults({
    method: 'Grid Overlay',
    aConform,
    perimeter,
    fixation,
    total,
    inputs: `Full squares: ${full}, Partial squares: ${partial}` +
            (perimeter > 0 ? `, Perimeter: ${perimeter} cm` : ''),
  });
}

function calculateRectangle() {
  const length = parseFloat(document.getElementById('rect-length').value);
  const width = parseFloat(document.getElementById('rect-width').value);
  let perimeter = parseFloat(document.getElementById('rect-perimeter').value);

  if (isNaN(length) || isNaN(width)) {
    alert('Please enter the template length and width.');
    return;
  }

  const aConform = length * width;
  if (isNaN(perimeter) || perimeter <= 0) {
    perimeter = 2 * (length + width);
  }
  const fixation = perimeter * 0.5;
  const total = aConform + fixation;

  showResults({
    method: 'Bounding Rectangle',
    aConform,
    perimeter,
    fixation,
    total,
    inputs: `Length: ${length} cm, Width: ${width} cm, Perimeter: ${perimeter.toFixed(1)} cm`,
  });
}

function calculateElliptical() {
  const a = parseFloat(document.getElementById('ellipse-major').value);
  const b = parseFloat(document.getElementById('ellipse-minor').value);
  let perimeter = parseFloat(document.getElementById('ellipse-perimeter').value);

  if (isNaN(a) || isNaN(b)) {
    alert('Please enter the major and minor axes.');
    return;
  }

  const aConform = Math.PI * (a / 2) * (b / 2);

  // Ramanujan's approximation for ellipse perimeter
  if (isNaN(perimeter) || perimeter <= 0) {
    const h = Math.pow((a / 2 - b / 2), 2) / Math.pow((a / 2 + b / 2), 2);
    perimeter = Math.PI * (a / 2 + b / 2) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  }

  const fixation = perimeter * 0.5;
  const total = aConform + fixation;

  showResults({
    method: 'Elliptical Approximation',
    aConform,
    perimeter,
    fixation,
    total,
    inputs: `Major axis: ${a} cm, Minor axis: ${b} cm, Perimeter: ${perimeter.toFixed(1)} cm`,
  });
}

function calculateTraditional() {
  const length = parseFloat(document.getElementById('trad-length').value);
  const width = parseFloat(document.getElementById('trad-width').value);
  const depth = parseFloat(document.getElementById('trad-depth').value);

  if (isNaN(length) || isNaN(width) || isNaN(depth)) {
    alert('Please enter length, width, and depth.');
    return;
  }

  const volume = length * width * depth;
  const surfaceArea = length * width;
  const correctedEstimate = volume / 2.5;

  const aConform = surfaceArea;
  const perimeter = 2 * (length + width);
  const fixation = perimeter * 0.5;
  const total = aConform + fixation;

  showResults({
    method: 'Traditional (L x W x D)',
    aConform,
    perimeter,
    fixation,
    total,
    inputs: `Length: ${length} cm, Width: ${width} cm, Depth: ${depth} cm`,
    traditional: {
      volume,
      correctedEstimate,
    },
  });
}

// --- Display results ---

function showResults(data) {
  const resultsEl = document.getElementById('results');
  resultsEl.style.display = 'block';
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('result-area').textContent = data.aConform.toFixed(1) + ' cm\u00B2';

  const fixationRow = document.getElementById('fixation-row');
  const totalNf = document.getElementById('total-no-fixation');

  if (data.fixation > 0) {
    fixationRow.style.display = 'flex';
    totalNf.style.display = 'none';
    document.getElementById('result-fixation').textContent = data.fixation.toFixed(1) + ' cm\u00B2';
    document.getElementById('result-total').textContent = data.total.toFixed(1) + ' cm\u00B2';
  } else {
    fixationRow.style.display = 'none';
    totalNf.style.display = 'flex';
    document.getElementById('result-total-nf').textContent = data.total.toFixed(1) + ' cm\u00B2';
  }

  renderGraftOptions(data.total);

  const compBox = document.getElementById('comparison-box');
  if (data.traditional) {
    compBox.style.display = 'block';
    document.getElementById('comp-traditional').textContent = data.traditional.volume.toFixed(1) + ' cm\u00B3';
    document.getElementById('comp-corrected').textContent = data.traditional.correctedEstimate.toFixed(1) + ' cm\u00B2 (est.)';
  } else {
    compBox.style.display = 'none';
  }

  renderDocumentation(data);
  saveToHistory(data);
}

function renderGraftOptions(totalArea) {
  const container = document.getElementById('graft-options');
  container.innerHTML = '';

  let recommendedFound = false;

  GRAFT_SIZES.forEach(size => {
    const div = document.createElement('div');
    div.className = 'graft-option';

    const isMatch = size.area >= totalArea;
    const tooSmall = size.area < totalArea;

    if (isMatch && !recommendedFound) {
      div.classList.add('recommended');
      recommendedFound = true;
      const badge = document.createElement('div');
      badge.className = 'graft-badge';
      badge.textContent = 'Best Fit';
      div.appendChild(badge);
    }

    if (tooSmall) {
      div.classList.add('too-small');
    }

    const sizeLabel = document.createElement('div');
    sizeLabel.className = 'graft-size';
    sizeLabel.textContent = size.label;
    div.appendChild(sizeLabel);

    const areaLabel = document.createElement('div');
    areaLabel.className = 'graft-area';
    areaLabel.textContent = size.area + ' cm\u00B2';
    div.appendChild(areaLabel);

    if (isMatch) {
      const waste = size.area - totalArea;
      const wasteLabel = document.createElement('div');
      wasteLabel.className = 'graft-waste';
      wasteLabel.textContent = 'Waste: ~' + waste.toFixed(1) + ' cm\u00B2 (' + ((waste / size.area) * 100).toFixed(0) + '%)';
      div.appendChild(wasteLabel);
    }

    container.appendChild(div);
  });

  if (!recommendedFound) {
    const div = document.createElement('div');
    div.className = 'graft-option recommended';
    const badge = document.createElement('div');
    badge.className = 'graft-badge';
    badge.textContent = 'Multiple Sheets';
    div.appendChild(badge);
    const sizeLabel = document.createElement('div');
    sizeLabel.className = 'graft-size';
    sizeLabel.textContent = 'Custom';
    div.appendChild(sizeLabel);
    const areaLabel = document.createElement('div');
    areaLabel.className = 'graft-area';
    areaLabel.textContent = 'Area > 120 cm\u00B2 \u2014 combine sheets';
    div.appendChild(areaLabel);
    container.appendChild(div);
  }
}

function renderDocumentation(data) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  let graftRec = 'Multiple sheets / custom';
  for (const size of GRAFT_SIZES) {
    if (size.area >= data.total) {
      graftRec = size.label + ' (' + size.area + ' cm\u00B2)';
      break;
    }
  }

  let doc = `Date: ${dateStr} ${timeStr}
Measurement Method: ${data.method}
Inputs: ${data.inputs}

Conformable Area (A_conform): ${data.aConform.toFixed(1)} cm\u00B2`;

  if (data.fixation > 0) {
    doc += `
Wound Perimeter: ${data.perimeter.toFixed(1)} cm
Fixation Edge (P x 0.5 cm): ${data.fixation.toFixed(1)} cm\u00B2`;
  }

  doc += `
Total Graft Area Needed: ${data.total.toFixed(1)} cm\u00B2
Recommended Graft Size: ${graftRec}`;

  if (data.traditional) {
    doc += `

--- Traditional Comparison ---
L x W x D Volume: ${data.traditional.volume.toFixed(1)} cm\u00B3
Estimated Overestimate Factor: ~2.5x
Corrected Estimate: ${data.traditional.correctedEstimate.toFixed(1)} cm\u00B2`;
  }

  document.getElementById('doc-output').textContent = doc;
}

// --- Copy to clipboard ---
function copyDocumentation() {
  const text = document.getElementById('doc-output').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.btn-copy');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = '#27ae60';
    btn.style.color = '#fff';
    btn.style.borderColor = '#27ae60';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  });
}

// --- History (localStorage) ---
function saveToHistory(data) {
  const history = JSON.parse(localStorage.getItem('woundCalcHistory') || '[]');
  history.unshift({
    timestamp: new Date().toISOString(),
    method: data.method,
    inputs: data.inputs,
    aConform: data.aConform,
    total: data.total,
  });
  if (history.length > 50) history.pop();
  localStorage.setItem('woundCalcHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('woundCalcHistory') || '[]');
  const card = document.getElementById('history-card');
  const list = document.getElementById('history-list');

  if (history.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';
  list.innerHTML = '';

  history.slice(0, 10).forEach(entry => {
    const div = document.createElement('div');
    div.className = 'history-entry';

    const date = new Date(entry.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
      <div>
        <strong>${entry.method}</strong> &mdash; ${entry.total.toFixed(1)} cm&sup2;
        <div class="history-meta">${entry.inputs}</div>
      </div>
      <div class="history-meta">${dateStr} ${timeStr}</div>
    `;
    list.appendChild(div);
  });
}

function clearHistory() {
  localStorage.removeItem('woundCalcHistory');
  renderHistory();
}

function exportHistory() {
  const history = JSON.parse(localStorage.getItem('woundCalcHistory') || '[]');
  if (history.length === 0) return;

  let csv = 'Date,Method,Inputs,A_conform (cm2),Total Area (cm2)\n';
  history.forEach(entry => {
    const date = new Date(entry.timestamp).toISOString();
    csv += `"${date}","${entry.method}","${entry.inputs}",${entry.aConform.toFixed(1)},${entry.total.toFixed(1)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wound_measurements_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// --- Init ---
renderHistory();
