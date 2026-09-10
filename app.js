// --- FULL 228 DYNAMIC PLOT DATASET GENERATOR (135 AVAILABLE, 32 PRE-BOOKED, 61 SOLD) ---
function generateFull228PlotDataset() {
  const totalPlots = 228;
  const targetAvailable = 135;
  const targetPrebooked = 32;
  const targetSold = 61;

  const statusList = [];
  for (let i = 0; i < targetAvailable; i++) statusList.push('AVAILABLE');
  for (let i = 0; i < targetPrebooked; i++) statusList.push('PRE-BOOKED');
  for (let i = 0; i < targetSold; i++) statusList.push('SOLD');

  // Deterministic shuffle pattern
  for (let i = statusList.length - 1; i > 0; i--) {
    const j = (i * 31 + 7) % statusList.length;
    const temp = statusList[i];
    statusList[i] = statusList[j];
    statusList[j] = temp;
  }

  const roadNames = ['30 Ft Street 1', '30 Ft Street 2', '30 Ft Street 3', '40 Ft Main Boulevard', '40 Ft East Boulevard', '30 Ft West Avenue'];
  const facings = ['East Facing', 'North Facing', 'South Facing', 'West Facing', 'Corner Facing'];
  const centsList = [
    { cents: '2.06 Cents', size: '900 Sq.Ft', dim: '30\' × 30\'', price: '₹ 21.60 Lakhs' },
    { cents: '2.41 Cents', size: '1,050 Sq.Ft', dim: '30\' × 35\'', price: '₹ 25.20 Lakhs' },
    { cents: '2.75 Cents', size: '1,200 Sq.Ft', dim: '30\' × 40\'', price: '₹ 28.80 Lakhs' },
    { cents: '3.44 Cents', size: '1,500 Sq.Ft', dim: '30\' × 50\'', price: '₹ 36.00 Lakhs' },
    { cents: '4.13 Cents', size: '1,800 Sq.Ft', dim: '40\' × 45\'', price: '₹ 45.00 Lakhs' }
  ];

  // 8 Grid Sub-Blocks in SVG Canvas (1080x720)
  const blocks = [
    // North Blocks (y: 35..325)
    { xStart: 30,  yStart: 35,  cols: 6, rows: 5, colGap: 34, rowGap: 56, width: 28, height: 48 },
    { xStart: 285, yStart: 35,  cols: 5, rows: 5, colGap: 36, rowGap: 56, width: 28, height: 48 },
    { xStart: 525, yStart: 35,  cols: 5, rows: 5, colGap: 36, rowGap: 56, width: 28, height: 48 },
    { xStart: 765, yStart: 35,  cols: 5, rows: 5, colGap: 36, rowGap: 56, width: 28, height: 48 },

    // South Blocks (y: 405..695)
    { xStart: 30,  yStart: 405, cols: 6, rows: 5, colGap: 34, rowGap: 56, width: 28, height: 48 },
    { xStart: 285, yStart: 405, cols: 5, rows: 5, colGap: 36, rowGap: 56, width: 28, height: 48 },
    { xStart: 525, yStart: 405, cols: 5, rows: 5, colGap: 36, rowGap: 56, width: 28, height: 48 },
    { xStart: 765, yStart: 405, cols: 5, rows: 5, colGap: 36, rowGap: 56, width: 28, height: 48 }
  ];

  const plots = [];
  let plotCounter = 0;

  for (let b = 0; b < blocks.length; b++) {
    const blk = blocks[b];
    for (let r = 0; r < blk.rows; r++) {
      for (let c = 0; c < blk.cols; c++) {
        if (plotCounter >= totalPlots) break;

        const num = 101 + plotCounter;
        const x = blk.xStart + c * blk.colGap;
        const y = blk.yStart + r * blk.rowGap;

        const spec = centsList[plotCounter % centsList.length];
        const facing = (c === 0 || c === blk.cols - 1 || r === 0) ? 'Corner Facing' : facings[plotCounter % (facings.length - 1)];
        const road = roadNames[b % roadNames.length];
        const status = statusList[plotCounter];

        plots.push({
          id: `PLOT-${num}`,
          number: `${num}`,
          cents: spec.cents,
          size: spec.size,
          dim: spec.dim,
          facing: facing,
          price: spec.price,
          road: road,
          status: status,
          x: Math.round(x),
          y: Math.round(y),
          w: blk.width,
          h: blk.height
        });

        plotCounter++;
      }
    }
  }

  return plots;
}

let plotDataset = generateFull228PlotDataset();

let selectedPlotId = null;
let currentFilter = 'all';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  loadSavedPlotState();
  initNavOverlay();
  highlightActiveMenuLink();

  if (document.getElementById('loading-screen')) {
    initLoadingSequence();
  }

  if (document.getElementById('hero-slide-1')) {
    initHeroSlider();
  }

  if (document.getElementById('plot-masterplan-svg')) {
    renderMasterPlanSvg();
    updateAvailabilityCounts();
  }

  if (document.getElementById('admin-plot-table-body')) {
    renderAdminTable();
    updateAdminMetrics();
  }

  initDefaultEnquiries();
  if (document.getElementById('admin-enquiry-table-body')) {
    renderAdminEnquiries();
  }

  initReplayButton();
  initSelectedPlotUrlParams();
  initGalleryModal();
  initGalleryFilter();
});

// HERO DUAL BACKGROUND SLIDER
function initHeroSlider() {
  const slide1 = document.getElementById('hero-slide-1');
  const slide2 = document.getElementById('hero-slide-2');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slide1 || !slide2) return;

  let currentSlide = 0;
  let sliderInterval = null;

  function goToSlide(index) {
    currentSlide = index;
    if (currentSlide === 0) {
      slide1.classList.add('active');
      slide2.classList.remove('active');
    } else {
      slide2.classList.add('active');
      slide1.classList.remove('active');
    }

    dots.forEach((dot, idx) => {
      if (idx === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function startAutoSlide() {
    if (sliderInterval) clearInterval(sliderInterval);
    sliderInterval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % 2;
      goToSlide(nextSlide);
    }, 6000);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.currentTarget.getAttribute('data-slide'), 10);
      goToSlide(targetIndex);
      startAutoSlide();
    });
  });

  startAutoSlide();
}

// NAVIGATION DRAWER & HEADER SCROLL BLEND
function initNavOverlay() {
  const openBtn = document.getElementById('open-nav-btn');
  const closeBtn = document.getElementById('close-nav-btn');
  const navOverlay = document.getElementById('nav-overlay');
  const header = document.querySelector('.site-header');

  let backdrop = document.getElementById('nav-backdrop');
  if (!backdrop && navOverlay) {
    backdrop = document.createElement('div');
    backdrop.id = 'nav-backdrop';
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function openDrawer() {
    if (navOverlay) navOverlay.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (navOverlay) navOverlay.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openBtn) {
    openBtn.addEventListener('click', openDrawer);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navOverlay && navOverlay.classList.contains('open')) {
      closeDrawer();
    }
  });

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

function highlightActiveMenuLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const overlayLinks = document.querySelectorAll('.overlay-link');

  overlayLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// 3-SECOND LOADING SEQUENCE
function initLoadingSequence() {
  const loadingScreen = document.getElementById('loading-screen');
  const fill = document.getElementById('loader-fill');
  const statusText = document.getElementById('loader-status');

  if (!loadingScreen) return;

  loadingScreen.classList.remove('fade-out');
  if (fill) fill.style.width = '0%';
  if (statusText) statusText.textContent = 'INITIALIZING MASTER PLAN...';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 1;
    if (fill) fill.style.width = `${progress}%`;

    if (progress === 35 && statusText) {
      statusText.textContent = 'TAMILNADU NO 1 BIGGEST FARM PLOTS';
    } else if (progress === 70 && statusText) {
      statusText.textContent = 'WELCOME TO VELS DEVELOPMENTS';
    } else if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 800);
      }, 250);
    }
  }, 30);
}

function initReplayButton() {
  const replayBtn = document.getElementById('replay-intro-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        initLoadingSequence();
      } else {
        window.location.href = 'index.html?replay=true';
      }
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('replay') === 'true' && document.getElementById('loading-screen')) {
    initLoadingSequence();
  }
}

// INTERACTIVE MASTER PLAN SVG RENDERER
function renderMasterPlanSvg() {
  const svgGroup = document.getElementById('svg-plots-group');
  if (!svgGroup) return;

  svgGroup.innerHTML = '';

  plotDataset.forEach(plot => {
    const isFilteredOut = currentFilter !== 'all' && plot.status !== currentFilter;
    const statusClass = `status-${plot.status.toLowerCase().replace('-', '')}`;
    const isSelected = selectedPlotId === plot.id;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'plot-node');
    if (isFilteredOut) {
      g.setAttribute('opacity', '0.2');
    }

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', plot.x);
    rect.setAttribute('y', plot.y);
    rect.setAttribute('width', plot.w);
    rect.setAttribute('height', plot.h);
    rect.setAttribute('rx', '3');
    rect.setAttribute('class', `plot-rect ${statusClass} ${isSelected ? 'selected' : ''}`);

    rect.addEventListener('click', () => {
      selectPlot(plot.id);
    });

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', plot.x + plot.w / 2);
    text.setAttribute('y', plot.y + plot.h / 2 + 3);
    text.setAttribute('class', `plot-text ${plot.status === 'PRE-BOOKED' ? 'text-dark' : ''}`);
    text.setAttribute('text-anchor', 'middle');
    text.textContent = `${plot.number}`;

    g.appendChild(rect);
    g.appendChild(text);
    svgGroup.appendChild(g);
  });

  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.onclick = () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-filter');
      renderMasterPlanSvg();
    };
  });
}

function selectPlot(plotId) {
  selectedPlotId = plotId;
  const plot = plotDataset.find(p => p.id === plotId);
  if (!plot) return;

  renderMasterPlanSvg();

  const plotIdEl = document.getElementById('drawer-plot-id');
  if (plotIdEl) plotIdEl.textContent = `PLOT #${plot.number}`;

  const plotNameEl = document.getElementById('drawer-plot-name');
  if (plotNameEl) plotNameEl.textContent = `Plot ${plot.number} — ${plot.facing}`;

  const statusEl = document.getElementById('drawer-plot-status');
  if (statusEl) {
    let badgeClass = 'badge-available';
    if (plot.status === 'PRE-BOOKED') badgeClass = 'badge-prebooked';
    if (plot.status === 'SOLD') badgeClass = 'badge-sold';
    statusEl.innerHTML = `<span class="badge-status ${badgeClass}">${plot.status}</span>`;
  }

  const centsEl = document.getElementById('drawer-plot-cents');
  if (centsEl) centsEl.textContent = plot.cents;

  const plotSizeEl = document.getElementById('drawer-plot-size');
  if (plotSizeEl) plotSizeEl.textContent = plot.size;

  const plotDimEl = document.getElementById('drawer-plot-dim');
  if (plotDimEl) plotDimEl.textContent = plot.dim;

  const plotFacingEl = document.getElementById('drawer-plot-facing');
  if (plotFacingEl) plotFacingEl.textContent = plot.facing;

  const plotRoadEl = document.getElementById('drawer-plot-road');
  if (plotRoadEl) plotRoadEl.textContent = plot.road;

  const plotPriceEl = document.getElementById('drawer-plot-price');
  if (plotPriceEl) plotPriceEl.textContent = plot.price;

  const enquireBtn = document.getElementById('enquire-plot-btn');
  if (enquireBtn) {
    enquireBtn.onclick = () => {
      window.location.href = `contact.html?plot=${encodeURIComponent(`Plot #${plot.number} (${plot.cents} / ${plot.size}, ${plot.dim}, ${plot.facing}) - ${plot.price}`)}`;
    };
  }

  openDrawer();
}

function openDrawer() {
  const drawer = document.getElementById('plot-drawer');
  if (drawer) drawer.classList.add('open');
}

function closeDrawer() {
  const drawer = document.getElementById('plot-drawer');
  if (drawer) drawer.classList.remove('open');
}

document.getElementById('close-drawer-btn')?.addEventListener('click', closeDrawer);

function initSelectedPlotUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const plotParam = params.get('plot');
  if (plotParam && document.getElementById('form-plot-interest')) {
    document.getElementById('form-plot-interest').value = decodeURIComponent(plotParam);
  }
}

// STATE PERSISTENCE & COUNTERS
function updateAvailabilityCounts() {
  const availCount = plotDataset.filter(p => p.status === 'AVAILABLE').length;
  const bookedCount = plotDataset.filter(p => p.status === 'PRE-BOOKED').length;
  const soldCount = plotDataset.filter(p => p.status === 'SOLD').length;

  const cAvail = document.getElementById('count-available');
  if (cAvail) cAvail.textContent = String(availCount);

  const cBooked = document.getElementById('count-prebooked');
  if (cBooked) cBooked.textContent = String(bookedCount);

  const cSold = document.getElementById('count-sold');
  if (cSold) cSold.textContent = String(soldCount);
}

function loadSavedPlotState() {
  const saved = localStorage.getItem('vels_plot_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      parsed.forEach(savedPlot => {
        const item = plotDataset.find(p => p.id === savedPlot.id);
        if (item) item.status = savedPlot.status;
      });
    } catch (e) {
      console.error('Failed to parse saved state', e);
    }
  }
}

function savePlotState() {
  const stateToSave = plotDataset.map(p => ({ id: p.id, status: p.status }));
  localStorage.setItem('vels_plot_state', JSON.stringify(stateToSave));
}

// ADMIN PORTAL - PLOT TABLE PAGINATION & FILTER STATE
let adminCurrentPage = 1;
const adminPageSize = 25;
let adminSearchQuery = '';
let adminStatusFilter = 'ALL';

function handleAdminPlotSearch(query) {
  adminSearchQuery = (query || '').trim().replace(/^#/, '').toLowerCase();
  adminCurrentPage = 1;
  renderAdminTable();
}

function filterAdminPlotStatus(status) {
  adminStatusFilter = status;
  adminCurrentPage = 1;
  renderAdminTable();
}

function goToAdminPlotPage(page) {
  adminCurrentPage = page;
  renderAdminTable();
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-plot-table-body');
  if (!tbody) return;

  // Filter dataset by search query and status
  let filteredPlots = plotDataset.filter(plot => {
    const matchSearch = !adminSearchQuery || String(plot.number).toLowerCase().includes(adminSearchQuery);
    const matchStatus = adminStatusFilter === 'ALL' || plot.status === adminStatusFilter;
    return matchSearch && matchStatus;
  });

  const totalRecords = filteredPlots.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / adminPageSize));
  if (adminCurrentPage > totalPages) adminCurrentPage = totalPages;
  if (adminCurrentPage < 1) adminCurrentPage = 1;

  const startIndex = (adminCurrentPage - 1) * adminPageSize;
  const endIndex = Math.min(startIndex + adminPageSize, totalRecords);
  const pagePlots = filteredPlots.slice(startIndex, endIndex);

  tbody.innerHTML = '';

  if (pagePlots.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="6" style="text-align: center; padding: 24px; color: var(--text-secondary);">No plots found matching current search or filter criteria.</td>`;
    tbody.appendChild(tr);
  } else {
    pagePlots.forEach((plot, index) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${index * 35}ms`;

      let badgeClass = 'badge-available';
      if (plot.status === 'PRE-BOOKED') badgeClass = 'badge-prebooked';
      if (plot.status === 'SOLD') badgeClass = 'badge-sold';

      tr.innerHTML = `
        <td><strong>PLOT ${plot.number}</strong></td>
        <td>${plot.size}</td>
        <td>${plot.facing}</td>
        <td>${plot.price}</td>
        <td><span class="badge-status ${badgeClass}">${plot.status}</span></td>
        <td>
          <select onchange="updatePlotStatus('${plot.id}', this.value)" style="padding: 6px 12px; border-radius: 4px; border: 1px solid var(--gold-border); font-family: var(--font-body); font-weight: 600; background: var(--bg-cream); color: var(--olive-deep);">
            <option value="AVAILABLE" ${plot.status === 'AVAILABLE' ? 'selected' : ''}>AVAILABLE</option>
            <option value="PRE-BOOKED" ${plot.status === 'PRE-BOOKED' ? 'selected' : ''}>PRE-BOOKED</option>
            <option value="SOLD" ${plot.status === 'SOLD' ? 'selected' : ''}>SOLD</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Update Pagination Info
  const infoEl = document.getElementById('admin-plot-pagination-info');
  if (infoEl) {
    if (totalRecords === 0) {
      infoEl.textContent = 'Showing 0 plots';
    } else {
      infoEl.textContent = `Showing ${startIndex + 1} – ${endIndex} of ${totalRecords} plots`;
    }
  }

  // Update Pagination Controls (Arrow format)
  const controlsEl = document.getElementById('admin-plot-pagination-controls');
  if (controlsEl) {
    controlsEl.innerHTML = '';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-outline-gold';
    prevBtn.style.cssText = 'padding: 6px 12px; font-size: 0.85rem; font-weight: 700; border-radius: 6px; cursor: pointer;';
    prevBtn.innerHTML = '← Prev';
    prevBtn.disabled = adminCurrentPage <= 1;
    if (prevBtn.disabled) {
      prevBtn.style.opacity = '0.4';
      prevBtn.style.cursor = 'not-allowed';
    } else {
      prevBtn.onclick = () => goToAdminPlotPage(adminCurrentPage - 1);
    }
    controlsEl.appendChild(prevBtn);

    // Page Numbers / Indicator
    const pageIndicator = document.createElement('span');
    pageIndicator.style.cssText = 'font-size: 0.88rem; font-weight: 700; color: var(--olive-deep); padding: 0 10px;';
    pageIndicator.textContent = `Page ${adminCurrentPage} of ${totalPages}`;
    controlsEl.appendChild(pageIndicator);

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-outline-gold';
    nextBtn.style.cssText = 'padding: 6px 12px; font-size: 0.85rem; font-weight: 700; border-radius: 6px; cursor: pointer;';
    nextBtn.innerHTML = 'Next →';
    nextBtn.disabled = adminCurrentPage >= totalPages;
    if (nextBtn.disabled) {
      nextBtn.style.opacity = '0.4';
      nextBtn.style.cursor = 'not-allowed';
    } else {
      nextBtn.onclick = () => goToAdminPlotPage(adminCurrentPage + 1);
    }
    controlsEl.appendChild(nextBtn);
  }
}

function updateAdminMetrics() {
  const avail = plotDataset.filter(p => p.status === 'AVAILABLE').length;
  const booked = plotDataset.filter(p => p.status === 'PRE-BOOKED').length;
  const sold = plotDataset.filter(p => p.status === 'SOLD').length;

  const aAvail = document.getElementById('admin-count-avail');
  if (aAvail) aAvail.textContent = avail;

  const aBooked = document.getElementById('admin-count-booked');
  if (aBooked) aBooked.textContent = booked;

  const aSold = document.getElementById('admin-count-sold');
  if (aSold) aSold.textContent = sold;
}

function updatePlotStatus(plotId, newStatus) {
  const plot = plotDataset.find(p => p.id === plotId);
  if (plot) {
    plot.status = newStatus;
    savePlotState();
    updateAdminMetrics();
    renderAdminTable();
  }
}

// --- AI ASSISTANT LEAD SCORING ENGINE (0-100 SCORE MODEL) ---
function calculateAILeadScore(enquiry) {
  let score = 0;
  
  // 1. Purchase Timeline Scoring (Max 35 pts)
  const timeline = (enquiry.timeline || '').toLowerCase();
  if (timeline.includes('within 15 days') || timeline.includes('immediate') || timeline.includes('1 month')) score += 35;
  else if (timeline.includes('1 to 3 months')) score += 25;
  else if (timeline.includes('3 to 6 months')) score += 15;
  else score += 5;

  // 2. Budget Scoring (Max 25 pts)
  const budget = (enquiry.budget || '').toLowerCase();
  if (budget.includes('above ₹1 crore') || budget.includes('1 crore')) score += 25;
  else if (budget.includes('₹50 lakhs - ₹1 crore') || budget.includes('50 lakhs')) score += 22;
  else if (budget.includes('₹25 lakhs - ₹50 lakhs') || budget.includes('30 lakhs')) score += 18;
  else score += 10;

  // 3. Buying Purpose Scoring (Max 20 pts)
  const purpose = (enquiry.purpose || '').toLowerCase();
  if (purpose.includes('residential')) score += 20;
  else if (purpose.includes('investment')) score += 18;
  else if (purpose.includes('commercial')) score += 15;
  else score += 10;

  // 4. Intent & Engagement Activity Signals (Max 20 pts)
  const plot = (enquiry.plot || '').toLowerCase();
  const msg = (enquiry.message || '').toLowerCase();
  if (plot.includes('plot #') || plot.includes('vistas') || plot.includes('grove')) score += 10;
  if (msg.includes('site visit') || msg.includes('token') || msg.includes('immediately') || msg.length > 20) score += 10;

  score = Math.min(100, Math.max(0, score));

  let category, recommendation;
  if (score >= 80) {
    category = 'HOT LEAD 🔥';
    recommendation = `🔥 Contact ${enquiry.name} immediately. High purchase intention (${score}/100 score).`;
  } else if (score >= 50) {
    category = 'WARM LEAD ⚡';
    recommendation = `⚡ Follow up with ${enquiry.name} within 24-48h. Active planning stage (${score}/100 score).`;
  } else {
    category = 'COLD LEAD ❄️';
    recommendation = `❄️ Low immediate conversion probability (${score}/100 score). Add to quarterly nurture pipeline.`;
  }

  return { score, category, recommendation };
}

const SAMPLE_ENQUIRIES = [
  {
    id: 'ENQ-1001',
    name: 'Rahul',
    phone: '+91 98421 11223',
    email: 'rahul.dev@gmail.com',
    location: 'Coimbatore',
    purpose: 'Residential Construction (2,000 Sq.Ft Plot)',
    timeline: 'Within 1 Month (Immediate)',
    budget: '₹30 Lakhs',
    plot: 'Plot #104 - Vels Golden Vistas',
    message: 'Viewed 4 plots online + requested urgent site visit. Ready to buy within 1 month.',
    score: 94,
    category: 'HOT LEAD 🔥',
    recommendation: '🔥 Contact Rahul immediately. High purchase intention (Score 94/100).',
    date: '10 Sep 2026, 11:30 AM'
  },
  {
    id: 'ENQ-1002',
    name: 'Dr. Priya Sundaram',
    phone: '+91 94432 88990',
    email: 'drpriya@apollo.org',
    location: 'Pollachi',
    purpose: 'Investment & Appreciation',
    timeline: 'Within 15 Days (Immediate)',
    budget: 'Above ₹1 Crore',
    plot: 'Plot #112 & #113 (Corner Pair)',
    message: 'High ROI plot investment. Ready for immediate token advance payment.',
    score: 98,
    category: 'HOT LEAD 🔥',
    recommendation: '🔥 Contact Dr. Priya immediately. High value ₹1Cr+ advance ready (Score 98/100).',
    date: '10 Sep 2026, 10:15 AM'
  },
  {
    id: 'ENQ-1003',
    name: 'Karthik Raja',
    phone: '+91 97890 44556',
    email: 'karthik.raja@tech.com',
    location: 'Both Locations',
    purpose: 'Residential Construction',
    timeline: '1 to 3 Months',
    budget: '₹25 Lakhs - ₹50 Lakhs',
    plot: 'Sakthi Palm Grove',
    message: 'Exploring 3 Cent east facing plot for home building in 2 months.',
    score: 68,
    category: 'WARM LEAD ⚡',
    recommendation: '⚡ Follow up with Karthik within 24h. Active home planning stage (Score 68/100).',
    date: '09 Sep 2026, 04:45 PM'
  },
  {
    id: 'ENQ-1004',
    name: 'Arun',
    phone: '+91 91590 22334',
    email: 'arun.b@outlook.com',
    location: 'Coimbatore',
    purpose: 'Investment & Appreciation',
    timeline: 'Maybe after 1 year / 6+ Months',
    budget: '₹25 Lakhs',
    plot: 'Only viewed 1 plot',
    message: 'Planning land purchase maybe after 1 year.',
    score: 38,
    category: 'COLD LEAD ❄️',
    recommendation: '❄️ Low immediate conversion probability (Score 38/100). Add to quarterly newsletter.',
    date: '08 Sep 2026, 02:10 PM'
  },
  {
    id: 'ENQ-1005',
    name: 'Vijay Senthil',
    phone: '+91 96290 33445',
    email: 'vijay.senthil@yahoo.com',
    location: 'Pollachi',
    purpose: 'Farm Plot Retreat',
    timeline: '3 to 6 Months',
    budget: 'Below ₹25 Lakhs',
    plot: 'Vels Green Enclave',
    message: 'Interested in small farm plot coconut layout for weekend visits.',
    score: 45,
    category: 'COLD LEAD ❄️',
    recommendation: '❄️ Future prospect (Score 45/100). Send farm layout brochure.',
    date: '07 Sep 2026, 06:20 PM'
  }
];

function initDefaultEnquiries() {
  const existing = localStorage.getItem('vels_enquiries');
  if (!existing) {
    localStorage.setItem('vels_enquiries', JSON.stringify(SAMPLE_ENQUIRIES));
  }
}

function getStoredEnquiries() {
  initDefaultEnquiries();
  try {
    const list = JSON.parse(localStorage.getItem('vels_enquiries')) || [];
    // Ensure all items have computed AI scores
    return list.map(enq => {
      if (!enq.score) {
        const ai = calculateAILeadScore(enq);
        enq.score = ai.score;
        enq.category = ai.category;
        enq.recommendation = ai.recommendation;
      }
      return enq;
    });
  } catch (e) {
    return SAMPLE_ENQUIRIES;
  }
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('form-name').value;
  const phone = document.getElementById('form-phone').value;
  const email = document.getElementById('form-email') ? document.getElementById('form-email').value : '';
  const location = document.getElementById('form-location') ? document.getElementById('form-location').value : 'Coimbatore & Pollachi';
  const purpose = document.getElementById('form-purpose') ? document.getElementById('form-purpose').value : 'Residential Construction';
  const timeline = document.getElementById('form-timeline') ? document.getElementById('form-timeline').value : '1 to 3 Months';
  const budget = document.getElementById('form-budget') ? document.getElementById('form-budget').value : '₹25 Lakhs - ₹50 Lakhs';
  const plot = document.getElementById('form-plot-interest') ? document.getElementById('form-plot-interest').value : 'General Layout Enquiry';
  const message = document.getElementById('form-message') ? document.getElementById('form-message').value : '';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const tempEnquiry = { name, phone, email, location, purpose, timeline, budget, plot, message };
  const ai = calculateAILeadScore(tempEnquiry);

  const newEnquiry = {
    id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    phone,
    email: email || 'N/A',
    location,
    purpose,
    timeline,
    budget,
    plot: plot || 'General Layout',
    message: message || 'No additional notes',
    score: ai.score,
    category: ai.category,
    recommendation: ai.recommendation,
    date: dateStr
  };

  const enquiries = getStoredEnquiries();
  enquiries.unshift(newEnquiry);
  localStorage.setItem('vels_enquiries', JSON.stringify(enquiries));

  alert(`Thank you, ${name}!\n\nYour plot enquiry for ${plot || 'VELS developments'} has been received.\n\nOur property executive team in ${location} will get in touch with you shortly at +91 ${phone}.`);
  
  e.target.reset();

  if (document.getElementById('admin-enquiry-table-body')) {
    renderAdminEnquiries();
  }
}

let activeEnquiryFilter = 'ALL';

function filterEnquiriesTable(categoryKey) {
  activeEnquiryFilter = categoryKey;
  
  const chips = {
    'ALL': 'enquiry-chip-all',
    'HOT': 'enquiry-chip-hot',
    'WARM': 'enquiry-chip-warm',
    'COLD': 'enquiry-chip-cold'
  };

  Object.keys(chips).forEach(cat => {
    const btn = document.getElementById(chips[cat]);
    if (btn) {
      if (cat === categoryKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  renderAdminEnquiries(categoryKey);
}

function resetSampleEnquiries() {
  localStorage.setItem('vels_enquiries', JSON.stringify(SAMPLE_ENQUIRIES));
  filterEnquiriesTable('ALL');
  alert('Client enquiries reset to default AI Scored sample dataset.');
}

function renderAdminEnquiries(filterCat = activeEnquiryFilter) {
  const tbody = document.getElementById('admin-enquiry-table-body');
  if (!tbody) return;

  const enquiries = getStoredEnquiries();
  
  // SORT DESCENDING BY AI SCORE (HIGHEST PRIORITY CALL FIRST!)
  enquiries.sort((a, b) => b.score - a.score);

  let hotCount = 0;
  let warmCount = 0;
  let coldCount = 0;

  enquiries.forEach(enq => {
    if (enq.score >= 80) hotCount++;
    else if (enq.score >= 50) warmCount++;
    else coldCount++;
  });

  const elHot = document.getElementById('count-hot-leads');
  const elWarm = document.getElementById('count-warm-leads');
  const elCold = document.getElementById('count-cold-leads');
  const elTopScore = document.getElementById('count-top-score');

  if (elHot) elHot.textContent = hotCount;
  if (elWarm) elWarm.textContent = warmCount;
  if (elCold) elCold.textContent = coldCount;
  if (elTopScore && enquiries.length > 0) elTopScore.textContent = `${enquiries[0].score}/100`;

  let filtered = enquiries;
  if (filterCat === 'HOT') filtered = enquiries.filter(e => e.score >= 80);
  else if (filterCat === 'WARM') filtered = enquiries.filter(e => e.score >= 50 && e.score < 80);
  else if (filterCat === 'COLD') filtered = enquiries.filter(e => e.score < 50);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-secondary);">No scored enquiries found for filter [${filterCat}].</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((enq, idx) => {
    let badgeClass = 'badge-available';
    let badgeStyle = 'background: rgba(60, 90, 120, 0.15); color: #3c5a78; border: 1px solid #3c5a78;';
    let barColor = '#3c5a78';

    if (enq.score >= 80) {
      badgeClass = 'badge-sold';
      badgeStyle = 'background: rgba(217, 83, 79, 0.18); color: #d9534f; border: 1px solid #d9534f; font-weight: 800; text-shadow: 0 0 8px rgba(217, 83, 79, 0.4);';
      barColor = '#d9534f';
    } else if (enq.score >= 50) {
      badgeClass = 'badge-prebooked';
      badgeStyle = 'background: rgba(198, 161, 91, 0.18); color: var(--gold-antique); border: 1px solid var(--gold-primary); font-weight: 700;';
      barColor = '#C6A15B';
    }

    const cleanPhone = enq.phone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hello ${enq.name}, following up from VELS Sakthivel Groups regarding your plot enquiry for ${enq.plot}.`);

    return `
      <tr style="animation-delay: ${idx * 45}ms; ${enq.score >= 80 ? 'background: rgba(217, 83, 79, 0.03);' : ''}">
        <td>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 900; color: ${barColor};">${enq.score}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">/ 100</span>
          </div>
          <div style="width: 100px; height: 6px; background: rgba(0,0,0,0.08); border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${enq.score}%; height: 100%; background: ${barColor}; transition: width 0.8s ease;"></div>
          </div>
          <span class="badge-status ${badgeClass}" style="${badgeStyle}">${enq.category}</span>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--olive-deep); font-size: 0.95rem;">${enq.name}</div>
          <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--gold-antique); font-weight: 700;">${enq.phone}</div>
          <div style="font-size: 0.7rem; color: var(--text-secondary);">${enq.email}</div>
          <span style="font-size: 0.65rem; color: var(--sage-muted);">${enq.date}</span>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--olive-deep); font-size: 0.82rem;">${enq.location}</div>
          <div style="font-size: 0.78rem; color: var(--terracotta); font-weight: 700; font-family: var(--font-mono);">${enq.budget}</div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">${enq.purpose}</div>
        </td>
        <td>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--olive-deep);">${enq.timeline}</div>
          <div style="font-size: 0.75rem; color: var(--gold-antique); font-family: var(--font-mono);">${enq.plot}</div>
        </td>
        <td>
          <div style="font-size: 0.76rem; color: var(--olive-deep); background: rgba(198, 161, 91, 0.08); padding: 8px 10px; border-left: 3px solid ${barColor}; border-radius: 0 4px 4px 0; line-height: 1.4;">
            ${enq.recommendation}
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <a href="https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${waText}" target="_blank" rel="noopener" class="btn btn-outline-gold" style="font-size: 0.68rem; padding: 5px 8px; text-align: center; text-decoration: none;">
              WHATSAPP LEAD
            </a>
            <a href="tel:${enq.phone}" class="btn btn-outline-olive" style="font-size: 0.68rem; padding: 5px 8px; text-align: center; text-decoration: none;">
              CALL FIRST
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// --- GALLERY PROJECT DETAIL DATA & MODAL HANDLER ---
const galleryProjects = {
  'proj-1': {
    title: 'VELS GOLDEN VISTAS',
    location: 'Pollachi Main Road, Coimbatore',
    tag: 'FLAGSHIP GATED COMMUNITY',
    status: 'ONGOING LAYOUT',
    statusClass: 'badge-prebooked',
    img: 'Images/Hero_Arch.jpg',
    totalPlots: '228 DTCP Approved Plots',
    roadWidth: '40 Ft Main Boulevard & 30 Ft Streets',
    plotSizes: '2.0 to 10.0+ Cents (1,200 - 4,500 Sq.Ft)',
    approval: 'DTCP Approval No. 123/2024 • RERA Registered',
    price: 'Starting ₹ 21.60 Lakhs',
    highlights: 'Grand architectural entrance arch, 24/7 security kiosk, underground drainage, solar streetlights, and 10% reserved landscape park area.',
    description: 'Our flagship 22-acre gated plotted layout strategically located on Pollachi Main Road. Designed with wide 40ft asphalt roads, lush coconut groves, and instant bank loan approval.'
  },
  'proj-2': {
    title: 'SAKTHI PALM GROVE',
    location: 'Kovaipudur Bypass Corridor, Coimbatore',
    tag: 'LUXURY VILLA ENCLAVE',
    status: 'LAUNCHING SOON',
    statusClass: 'badge-available',
    img: 'Images/Hero_Villa.jpg',
    totalPlots: '85 Premium Villa Sites',
    roadWidth: '40 Ft Asphalt Avenues',
    plotSizes: '3.0 to 8.0 Cents (1,306 - 3,480 Sq.Ft)',
    approval: 'DTCP Approved Layout',
    price: 'Starting ₹ 28.50 Lakhs',
    highlights: 'Panoramic Western Ghats mountain views, gated compound perimeter wall, rainwater harvesting pits, and children play garden.',
    description: 'Exclusive villa plot enclave nestled in the serene foothills of Kovaipudur, featuring turnkey custom house construction by VELS engineers.'
  },
  'proj-3': {
    title: 'VELS GREEN ENCLAVE',
    location: 'Mahalingapuram, Pollachi',
    tag: 'PREMIUM FARM PLOTS',
    status: 'COMPLETED & DELIVERED',
    statusClass: 'badge-sold',
    img: 'Images/Vels_Legacy_Appreciation.jpg',
    totalPlots: '120 Agricultural-to-Residential Plots',
    roadWidth: '30 Ft & 40 Ft Concrete Kerb Roads',
    plotSizes: '5.0 to 15.0 Cents',
    approval: '100% Clear Title • Parent Deed Verified',
    price: 'Sold Out (High ROI Appreciation)',
    highlights: 'Mature coconut plantations, drip irrigation, electricity connection to every plot boundary, and 24/7 water supply.',
    description: 'A benchmark green farm plot development in Pollachi delivered with complete legal verification and 100% customer satisfaction.'
  },
  'proj-4': {
    title: 'EACHANARI HERITAGE LAYOUT',
    location: 'Eachanari Bypass Highway, Coimbatore',
    tag: 'HIGHWAY CORRIDOR ENCLAVE',
    status: 'FEW PLOTS AVAILABLE',
    statusClass: 'badge-available',
    img: 'Images/Vels_Engineered_Roads.jpg',
    totalPlots: '64 Gated Layout Parcels',
    roadWidth: '40 Ft Heavy-Duty Asphalt Road',
    plotSizes: '2.5 to 6.0 Cents',
    approval: 'DTCP Approval No. 88/2023',
    price: 'Starting ₹ 24.80 Lakhs',
    highlights: 'Direct connectivity to NH-209, 5 mins from top engineering institutions, underground utilities, and 24/7 solar lighting.',
    description: 'Prime residential layout offering high connectivity to industrial corridors, top engineering colleges, and IT hubs.'
  },
  'proj-5': {
    title: 'PEELAMEDU PARK VISTAS',
    location: 'Peelamedu Main Rd, Coimbatore',
    tag: 'URBAN PLOTTED COMMUNITY',
    status: 'COMPLETED',
    statusClass: 'badge-sold',
    img: 'Images/Plots_Hero_Bg.jpg',
    totalPlots: '42 Urban Plots',
    roadWidth: '30 Ft Internal Roads',
    plotSizes: '2.0 to 4.5 Cents',
    approval: 'DTCP & Local Body Approved',
    price: 'Starting ₹ 32.00 Lakhs',
    highlights: 'Gated entrance, corporation water supply connection, proximity to Coimbatore International Airport & major hospitals.',
    description: 'Urban plotted layout offering prime city convenience near Coimbatore International Airport and major healthcare hubs.'
  },
  'proj-6': {
    title: 'VELS HERITAGE GARDENS',
    location: 'Hope College Corridor, Coimbatore',
    tag: 'HERITAGE LANDSCAPE LAYOUT',
    status: 'ONGOING',
    statusClass: 'badge-prebooked',
    img: 'Images/Vels_Heritage_Story.jpg',
    totalPlots: '96 Gated Residential Plots',
    roadWidth: '40 Ft & 30 Ft Asphalt Roads',
    plotSizes: '2.75 to 7.5 Cents',
    approval: 'DTCP & RERA Approved',
    price: 'Starting ₹ 29.90 Lakhs',
    highlights: 'Lush avenue trees, compound wall security, underground drainage lines, and walking track.',
    description: 'Heritage residential community combining eco-friendly landscaping with robust civil infrastructure built under Sakthivel Groups.'
  }
};

function initGalleryModal() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('close-project-modal');
  if (!galleryItems.length || !modal) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const projId = item.getAttribute('data-project-id');
      const proj = galleryProjects[projId];
      if (!proj) return;

      const imgEl = document.getElementById('modal-project-img');
      if (imgEl) { imgEl.src = proj.img; imgEl.alt = proj.title; }

      const titleEl = document.getElementById('modal-project-title');
      if (titleEl) titleEl.textContent = proj.title;

      const locEl = document.getElementById('modal-project-location');
      if (locEl) locEl.textContent = proj.location;

      const tagEl = document.getElementById('modal-project-tag');
      if (tagEl) tagEl.textContent = proj.tag;

      const descEl = document.getElementById('modal-project-desc');
      if (descEl) descEl.textContent = proj.description;

      const unitsEl = document.getElementById('modal-project-units');
      if (unitsEl) unitsEl.textContent = proj.totalPlots;

      const roadsEl = document.getElementById('modal-project-roads');
      if (roadsEl) roadsEl.textContent = proj.roadWidth;

      const sizesEl = document.getElementById('modal-project-sizes');
      if (sizesEl) sizesEl.textContent = proj.plotSizes;

      const approvalEl = document.getElementById('modal-project-approval');
      if (approvalEl) approvalEl.textContent = proj.approval;

      const priceEl = document.getElementById('modal-project-price');
      if (priceEl) priceEl.textContent = proj.price;

      const hlEl = document.getElementById('modal-project-highlights');
      if (hlEl) hlEl.textContent = proj.highlights;

      const statusEl = document.getElementById('modal-project-status');
      if (statusEl) {
        statusEl.innerHTML = `<span class="badge-status ${proj.statusClass}">${proj.status}</span>`;
      }

      const enquireBtn = document.getElementById('modal-project-enquire-btn');
      if (enquireBtn) {
        enquireBtn.href = `contact.html?project=${encodeURIComponent(proj.title)}`;
      }

      modal.classList.add('open');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
    }
  });
}

// GALLERY CLASSIFYING FILTER BAR
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          item.style.display = 'flex';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
          }, 20);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px) scale(0.95)';
          setTimeout(() => {
            if (item.style.opacity === '0') {
              item.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });
}

