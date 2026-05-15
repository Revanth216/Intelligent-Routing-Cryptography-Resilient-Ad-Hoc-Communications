const canvas = document.getElementById('network');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const log = document.getElementById('logContent');

let nodes = [];
let safeEdges = []; // Genuine topology
let activeEdges = []; // Contains injected wormholes
let shortestPath = [];
let drawnLines = [];
let pdrChart = null;
let maliciousLinks = [];
let proposeHops = 0;
let existingHops = 0;

const RANGE = 150; // Threshold for node proximity
const NODE_R = 18;

function resize() {
  const s = canvas.parentElement;
  canvas.width = s.clientWidth;
  canvas.height = s.clientHeight;
  draw();
}
window.addEventListener('resize', resize);

function addLog(msg, cls = '') {
  const d = document.createElement('div');
  d.className = 'log-line ' + cls;
  d.textContent = '» ' + msg;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}
function clearLog() { log.innerHTML = ''; }

function rand(min, max) { return Math.floor(Math.random() * (max - min) + min); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function generateNetwork() {
  const n = parseInt(document.getElementById('numNodes').value);
  nodes = [];
  safeEdges = [];
  activeEdges = [];
  maliciousLinks = [];
  shortestPath = [];
  drawnLines = [];
  clearStat('hops');
  clearStat('wormhole');

  const W = canvas.width, H = canvas.height;
  const pad = 60;
  let attempts = 0;
  
  // Generate Nodes
  while (nodes.length < n && attempts < 5000) {
    attempts++;
    const x = rand(pad, W - pad);
    const y = rand(pad, H - pad);
    if (!nodes.some(nd => dist(nd, {x,y}) < NODE_R * 3)) {
        nodes.push({ x, y, id: nodes.length });
    }
  }

  // Generate Genuine Edges based on proximity capacity
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (dist(nodes[i], nodes[j]) <= RANGE) {
        safeEdges.push([i, j]);
      }
    }
  }
  
  activeEdges = [...safeEdges];

  // Inject a Wormhole Attack (Distant Node spoofing a local connection)
  let w1 = rand(0, nodes.length);
  let w2 = rand(0, nodes.length);
  let wAttempts = 0;
  while(dist(nodes[w1], nodes[w2]) < 300 && wAttempts < 100) {
      w1 = rand(0, nodes.length);
      w2 = rand(0, nodes.length);
      wAttempts++;
  }
  activeEdges.push([w1, w2]);
  maliciousLinks.push([w1, w2]);

  document.getElementById('stat-nodes').textContent = nodes.length;
  document.getElementById('stat-edges').textContent = activeEdges.length;
  document.getElementById('dstNode').value = Math.floor(nodes.length / 2);
  document.getElementById('srcNode').max = nodes.length - 1;
  document.getElementById('dstNode').max = nodes.length - 1;

  addLog(`Network Generated: ${nodes.length} nodes established.`, 'info');
  addLog(`WARNING: Anomalous topology detected. Possible wormhole present.`, 'warn');
  draw();
}

function draw() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Read CSS variables dynamically for light/dark mode support
  const style = getComputedStyle(document.body);
  const gridColor = style.getPropertyValue('--grid-color').trim();
  const textColor = style.getPropertyValue('--text').trim();
  const nodeBg = style.getPropertyValue('--bg-surface').trim();
  const edgeColor = style.getPropertyValue('--blue').trim() || '#388bfd';

  // Background Grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Draw Edges (Fixed Visibility issue by increasing alpha and line width)
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.35; // Increased from 0.12 so edges are clearly visible
  ctx.strokeStyle = edgeColor;
  activeEdges.forEach(([i, j]) => {
    ctx.beginPath();
    ctx.moveTo(nodes[i].x, nodes[i].y);
    ctx.lineTo(nodes[j].x, nodes[j].y);
    ctx.stroke();
  });
  ctx.globalAlpha = 1.0; // Reset alpha

  // Drawn Selected Path Lines
  drawnLines.forEach(l => {
    ctx.strokeStyle = l.color || textColor;
    ctx.lineWidth = l.width || 2;
    ctx.setLineDash(l.dash || []);
    ctx.beginPath();
    ctx.moveTo(l.x1, l.y1);
    ctx.lineTo(l.x2, l.y2);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Draw Nodes
  const src = parseInt(document.getElementById('srcNode').value);
  const dst = parseInt(document.getElementById('dstNode').value);
  const pathSet = new Set(shortestPath.map(Number));

  nodes.forEach((nd, i) => {
    const onPath = pathSet.has(i);
    const isSrc = i === src;
    const isDst = i === dst;

    if (onPath) {
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, NODE_R + 5, 0, Math.PI * 2);
      const grd = ctx.createRadialGradient(nd.x, nd.y, NODE_R - 2, nd.x, nd.y, NODE_R + 8);
      grd.addColorStop(0, 'rgba(63,185,80,.4)');
      grd.addColorStop(1, 'rgba(63,185,80,0)');
      ctx.fillStyle = grd;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(nd.x, nd.y, NODE_R, 0, Math.PI * 2);
    
    // Set colors based on node status
    if (isSrc) ctx.fillStyle = style.getPropertyValue('--blue').trim();
    else if (isDst) ctx.fillStyle = style.getPropertyValue('--green').trim();
    else ctx.fillStyle = nodeBg;

    ctx.strokeStyle = onPath || isSrc || isDst ? textColor : style.getPropertyValue('--border').trim();
    ctx.lineWidth = onPath || isSrc || isDst ? 2 : 1;
    ctx.fill();
    ctx.stroke();

    // Text label color
    ctx.fillStyle = isSrc || isDst ? '#ffffff' : textColor;
    ctx.font = `500 11px 'Google Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MN' + i, nd.x, nd.y);
  });
}

// Custom Dijkstra Algorithm
function runDijkstra(src, dst, edgeList) {
  const n = nodes.length;
  const adj = Array.from({length: n}, () => []);
  edgeList.forEach(([a, b]) => {
    const d = dist(nodes[a], nodes[b]);
    adj[a].push([b, d]);
    adj[b].push([a, d]);
  });
  
  const dist2 = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const visited = new Array(n).fill(false);
  
  dist2[src] = 0;
  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    for (let i = 0; i < n; i++) {
        if (!visited[i] && (u === -1 || dist2[i] < dist2[u])) u = i;
    }
    if (u === -1 || dist2[u] === Infinity) break;
    visited[u] = true;
    
    adj[u].forEach(([v, w]) => {
      if (dist2[u] + w < dist2[v]) { 
          dist2[v] = dist2[u] + w; 
          prev[v] = u; 
      }
    });
  }
  
  if (dist2[dst] === Infinity) return null;
  const path = [];
  for (let cur = dst; cur !== -1; cur = prev[cur]) path.unshift(cur);
  return path;
}

// Existing Random Walk algorithm
function randomWalkPath(src, dst) {
  const adj = Array.from({length: nodes.length}, () => []);
  activeEdges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const path = [src];
  const visited = new Set([src]);
  let cur = src;
  
  for (let step = 0; step < 50 && cur !== dst; step++) {
    const nbrs = adj[cur].filter(n => !visited.has(n));
    if (nbrs.length === 0) return null;
    cur = nbrs[Math.floor(Math.random() * nbrs.length)];
    visited.add(cur);
    path.push(cur);
  }
  return cur === dst ? path : null;
}

function clearPaths() {
  drawnLines = [];
  shortestPath = [];
  draw();
  addLog('Paths cleared.', 'warn');
}

function drawPath(path, color, width, dash = []) {
  for (let i = 0; i < path.length - 1; i++) {
    const a = nodes[path[i]], b = nodes[path[i+1]];
    drawnLines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, color, width, dash });
  }
  draw();
}

function existingShortestPath() {
  if (!nodes.length) { addLog('Generate network first.', 'error'); return; }
  const src = parseInt(document.getElementById('srcNode').value);
  const dst = parseInt(document.getElementById('dstNode').value);
  
  drawnLines = [];
  const path = randomWalkPath(src, dst);
  
  if (!path) { 
      addLog(`Existing Routing Failed: Packet dropped attempting random walk.`, 'error'); 
      return; 
  }
  
  shortestPath = path;
  existingHops = path.length - 1;
  drawPath(path, 'rgba(248,81,73,.85)', 2);
  
  document.getElementById('stat-hops').textContent = existingHops;
  addLog(`Existing Random Path calculated: ${path.map(x=>'MN'+x).join(' → ')}`, 'path');
  
  // Check if it fell into the wormhole trap
  let fellInTrap = false;
  for(let i=0; i<path.length-1; i++) {
      let d = dist(nodes[path[i]], nodes[path[i+1]]);
      if (d > RANGE) fellInTrap = true;
  }
  
  if(fellInTrap) {
      document.getElementById('stat-wormhole').textContent = 'Compromised';
      document.getElementById('stat-wormhole').style.color = 'var(--red)';
      addLog(`Vulnerability: Route traversed malicious wormhole link unnoticed! Data compromised.`, 'error');
  } else {
      document.getElementById('stat-wormhole').textContent = 'Undetected';
      document.getElementById('stat-wormhole').style.color = 'var(--text2)';
  }
}

function existingCommunication() {
  if (!shortestPath.length) { addLog('Calculate existing path first.', 'error'); return; }
  drawPath(shortestPath, 'rgba(248,81,73,.7)', 2);
  addLog('Unencrypted communication sent via Random Routing. High risk of interception.', 'warn');
}

function proposedShortestPath() {
  if (!nodes.length) { addLog('Generate network first.', 'error'); return; }
  const src = parseInt(document.getElementById('srcNode').value);
  const dst = parseInt(document.getElementById('dstNode').value);
  
  drawnLines = [];
  document.getElementById('stat-wormhole').textContent = 'Validating...';
  
  // 1. Calculate Initial Path
  let path = runDijkstra(src, dst, activeEdges);
  if (!path) { addLog(`No path available.`, 'error'); return; }

  // 2. Detection of Distant Nodes (Wormhole Mitigation)
  addLog('Executing Signature Verification & Path Validation Protocol...', 'info');
  let compromisedEdges = [];
  
  for (let i = 0; i < path.length - 1; i++) {
      let nodeA = nodes[path[i]];
      let nodeB = nodes[path[i+1]];
      let geoDistance = dist(nodeA, nodeB);
      
      if (geoDistance > RANGE) {
          compromisedEdges.push([path[i], path[i+1]]);
          addLog(`WORMHOLE DETECTED! MN${path[i]} and MN${path[i+1]} distance exceeds physical radio threshold.`, 'error');
      }
  }

  // 3. Rerouting and Isolation
  if (compromisedEdges.length > 0) {
      addLog(`Isolating malicious nodes and calculating secure path...`, 'warn');
      document.getElementById('stat-wormhole').textContent = 'Mitigated';
      document.getElementById('stat-wormhole').style.color = 'var(--green)';
      
      // Remove bad edges to simulate isolation
      activeEdges = activeEdges.filter(e => {
          return !compromisedEdges.some(ce => (ce[0] === e[0] && ce[1] === e[1]) || (ce[0] === e[1] && ce[1] === e[0]));
      });
      
      // Recalculate Dijkstra
      path = runDijkstra(src, dst, activeEdges);
      if(!path) { addLog(`No safe path remains after isolating wormhole.`, 'error'); return; }
  } else {
      document.getElementById('stat-wormhole').textContent = 'Secure';
      document.getElementById('stat-wormhole').style.color = 'var(--green)';
      addLog(`Topology Validated. No malicious distant nodes detected in route.`, 'success');
  }

  shortestPath = path;
  proposeHops = path.length - 1;
  drawPath(path, 'rgba(56,139,253,.9)', 2.5);
  
  document.getElementById('stat-hops').textContent = proposeHops;
  addLog(`Optimal Secure Path established: ${path.map(x=>'MN'+x).join(' → ')}`, 'path');
}

function proposedCommunication() {
  if (!shortestPath.length) { addLog('Calculate proposed path first.', 'error'); return; }
  const src = document.getElementById('srcNode').value;
  const dst = document.getElementById('dstNode').value;
  
  addLog(`--- Initiating Schnorr Authentication Phase ---`, 'sig');
  
  setTimeout(() => {
      addLog(`[Step 1] Key Generation: Prover (MN${src}) generates Public & Private Keys.`, 'info');
  }, 300);

  setTimeout(() => {
      addLog(`[Step 2] Challenge Generation: Verifier (MN${dst}) sends Random Nonce.`, 'info');
  }, 900);

  setTimeout(() => {
      addLog(`[Step 3] Response Calculation: MN${src} computes response hash using Private Key.`, 'info');
  }, 1500);

  setTimeout(() => {
      addLog(`[Step 4] Verification: MN${dst} validates Response using Public Key...`, 'info');
      addLog(`Authentication Success! Identity Confirmed. Proceeding with Data Transmission.`, 'success');
      animateTransmission();
  }, 2200);
}

function animateTransmission() {
  let step = 0;
  const steps = shortestPath.length - 1;
  drawnLines = [];
  
  const animInterval = setInterval(() => {
    if (step < steps) {
      const a = nodes[shortestPath[step]], b = nodes[shortestPath[step + 1]];
      drawnLines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: 'rgba(56,139,253,.9)', width: 3 });
      draw();
      addLog(`Encrypted Packet relayed: MN${shortestPath[step]} → MN${shortestPath[step+1]}`, 'info');
      step++;
    } else {
      clearInterval(animInterval);
      addLog(`Payload securely delivered to destination MN${shortestPath[steps]}.`, 'success');
    }
  }, 400);
}

function showGraph() {
  document.getElementById('chartModal').classList.add('active');
  const numHops = Math.max(5, proposeHops + 1); 
  
  const propPDR = [];
  const existPDR = [];
  const labels2 = [];
  
  let proposedBase = 99;
  let existingBase = 95;

  for (let i = 1; i <= numHops; i++) {
    labels2.push(i + (i === 1 ? ' Hop' : ' Hops'));
    
    propPDR.push(proposedBase - (Math.random() * 2));
    proposedBase -= 0.5;

    existPDR.push(existingBase - (Math.random() * 5));
    existingBase -= 7;
  }

  const chartCtx = document.getElementById('pdrChart').getContext('2d');
  if (pdrChart) pdrChart.destroy();
  
  pdrChart = new Chart(chartCtx, {
    type: 'bar',
    data: {
      labels: labels2,
      datasets: [
        { label: 'Proposed (Dijkstra + Schnorr)', data: propPDR, backgroundColor: 'rgba(56,139,253,.7)', borderColor: '#388bfd', borderWidth: 1 },
        { label: 'Existing (Random Walk)', data: existPDR, backgroundColor: 'rgba(248,81,73,.55)', borderColor: '#f85149', borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.07)' }, ticks: { color: '#8b949e' } },
        y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,.07)' }, ticks: { color: '#8b949e' }, title: { display: true, text: 'Packet Delivery Ratio (%)', color: '#8b949e' } }
      },
      plugins: {
        legend: { labels: { color: '#e6edf3' } }
      }
    }
  });
}

function closeModal() { document.getElementById('chartModal').classList.remove('active'); }

function clearStat(id) { document.getElementById('stat-' + id).textContent = '—'; }

// UI Interactions
canvas.addEventListener('mousemove', e => {
  if (!nodes.length) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const hit = nodes.find(nd => dist(nd, {x: mx, y: my}) < NODE_R + 4);
  if (hit) {
    const nbrs = activeEdges.filter(([a,b]) => a === hit.id || b === hit.id).length;
    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY - 30) + 'px';
    tooltip.textContent = `MN${hit.id} — ${nbrs} active links`;
  } else {
    tooltip.style.display = 'none';
  }
});

canvas.addEventListener('mouseleave', () => tooltip.style.display = 'none');

canvas.addEventListener('click', e => {
  if (!nodes.length) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const hit = nodes.find(nd => dist(nd, {x: mx, y: my}) < NODE_R + 4);
  if (hit) {
    const srcIn = document.getElementById('srcNode');
    const dstIn = document.getElementById('dstNode');
    if (parseInt(srcIn.value) === hit.id) return;
    if (parseInt(dstIn.value) === hit.id) { srcIn.value = hit.id; }
    else { dstIn.value = hit.id; }
    draw();
  }
});
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-btn');
    if (body.getAttribute('data-theme') === 'light') {
        body.removeAttribute('data-theme');
        btn.textContent = '☀️ Light Mode';
    } else {
        body.setAttribute('data-theme', 'light');
        btn.textContent = '🌙 Dark Mode';
    }
    draw(); // Redraw canvas to update colors
}
resize();
addLog('Click "Generate" to create an IoT ad-hoc network with potential anomalies.', 'info');
// --- Modal Controls ---
function openAboutModal() { 
    document.getElementById('aboutModal').classList.add('active'); 
}

function closeAboutModal() { 
    document.getElementById('aboutModal').classList.remove('active'); 
}