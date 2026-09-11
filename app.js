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
  if (document.getElementById('admin-enquiry-table-body')) {
    loadAdminEnquiries();
  }

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

// --- EXECUTIVE ADMIN AUTHENTICATION GATEWAY ---
function checkAdminAuth() {
  const loginGateway = document.getElementById('admin-login-gateway');
  const mainDashboard = document.getElementById('admin-main-dashboard');
  const logoutBtn = document.getElementById('admin-logout-btn');

  if (!loginGateway || !mainDashboard) return;

  const isAuthenticated = sessionStorage.getItem('vels_admin_authenticated') === 'true';

  if (isAuthenticated) {
    loginGateway.style.display = 'none';
    mainDashboard.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (typeof renderAdminEnquiries === 'function') {
      renderAdminEnquiries();
    }
  } else {
    loginGateway.style.display = 'flex';
    mainDashboard.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function handleAdminLogin(event) {
  if (event) event.preventDefault();

  const userInput = document.getElementById('admin-username')?.value.trim();
  const passInput = document.getElementById('admin-password')?.value.trim();
  const authFactorInput = document.getElementById('admin-auth-factor')?.value.trim();
  const errorEl = document.getElementById('admin-login-error');

  const validUsername = 'admin';
  const isValidPassword = passInput === 'VelsAdmin@2026!' || passInput === 'admin123';
  const validAuthFactor = 'VELS-2026-SECURE';

  if (userInput === validUsername && isValidPassword && authFactorInput === validAuthFactor) {
    sessionStorage.setItem('vels_admin_authenticated', 'true');
    if (errorEl) errorEl.style.display = 'none';
    checkAdminAuth();
  } else {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'Invalid credentials or authentication factor string. Please try again.';
    }
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('vels_admin_authenticated');
  checkAdminAuth();
}

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

  const overlayLinks = document.querySelectorAll('.overlay-link');
  overlayLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      closeDrawer();
      const href = link.getAttribute('href');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      if (href === currentPage || (href === 'index.html' && (currentPage === '' || currentPage === 'index.html'))) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

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
    category = 'HOT LEAD';
    recommendation = `Contact ${enquiry.name} immediately. High purchase intention (${score}/100 score).`;
  } else if (score >= 50) {
    category = 'WARM LEAD';
    recommendation = `Follow up with ${enquiry.name} within 24-48h. Active planning stage (${score}/100 score).`;
  } else {
    category = 'COLD LEAD';
    recommendation = `Low immediate conversion probability (${score}/100 score). Add to quarterly nurture pipeline.`;
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
    category: 'HOT LEAD',
    recommendation: 'Contact Rahul immediately. High purchase intention (Score 94/100).',
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
    category: 'HOT LEAD',
    recommendation: 'Contact Dr. Priya immediately. High value ₹1Cr+ advance ready (Score 98/100).',
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
    category: 'WARM LEAD',
    recommendation: 'Follow up with Karthik within 24h. Active home planning stage (Score 68/100).',
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
    category: 'COLD LEAD',
    recommendation: 'Low immediate conversion probability (Score 38/100). Add to quarterly newsletter.',
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
    category: 'COLD LEAD',
    recommendation: 'Future prospect (Score 45/100). Send farm layout brochure.',
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

async function handleContactSubmit(e) {
  if (e) e.preventDefault();

  const name = document.getElementById('form-name')?.value || '';
  const phone = document.getElementById('form-phone')?.value || '';
  const email = document.getElementById('form-email')?.value || '';
  const location = document.getElementById('form-location')?.value || 'Coimbatore & Pollachi';
  const purpose = document.getElementById('form-purpose')?.value || 'Residential Construction';
  const timeline = document.getElementById('form-timeline')?.value || '1 to 3 Months';
  const budget = document.getElementById('form-budget')?.value || '₹25 Lakhs - ₹50 Lakhs';
  const plot = document.getElementById('form-plot-interest')?.value || 'General Layout Enquiry';
  const message = document.getElementById('form-message')?.value || '';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  let savedRecord = null;

  // 1. Send POST request to backend API
  try {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        phone,
        email,
        project: location,
        plotNumber: plot || 'General Layout Enquiry',
        budget,
        timeline,
        paymentMode: purpose,
        siteVisitRequested: true,
        message: `${purpose} • ${message}`
      })
    });
    const data = await res.json();
    if (data.success && data.lead) {
      const bl = data.lead;
      savedRecord = {
        id: bl.id,
        name: bl.customerName || name,
        customerName: bl.customerName || name,
        phone: bl.phone || phone,
        email: bl.email || email || 'N/A',
        location: bl.project || location,
        project: bl.project || location,
        purpose: bl.paymentMode || purpose,
        paymentMode: bl.paymentMode || purpose,
        timeline: bl.timeline || timeline,
        budget: bl.budget || budget,
        plot: bl.plotNumber || plot || 'General Layout',
        plotNumber: bl.plotNumber || plot || 'General Layout',
        message: bl.message || message,
        score: bl.aiScore || 50,
        aiScore: bl.aiScore || 50,
        category: `${bl.aiPriority || 'WARM'} LEAD`,
        aiPriority: bl.aiPriority || 'WARM',
        recommendation: (bl.aiSummary || bl.recommendedAction || '').replace(/[🔥⚡❄️]/g, '').trim(),
        aiSummary: bl.aiSummary || '',
        recommendedAction: bl.recommendedAction || '',
        isNew: true,
        status: 'NEW',
        date: dateStr
      };
    }
  } catch (err) {
    console.log('Backend API offline, saving locally to localStorage.');
  }

  if (!savedRecord) {
    const tempEnquiry = { name, phone, email, location, purpose, timeline, budget, plot, message };
    const ai = calculateAILeadScore(tempEnquiry);
    savedRecord = {
      id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      customerName: name,
      phone,
      email: email || 'N/A',
      location,
      project: location,
      purpose,
      paymentMode: purpose,
      timeline,
      budget,
      plot: plot || 'General Layout',
      plotNumber: plot || 'General Layout',
      message: message || 'No additional notes',
      score: ai.score,
      aiScore: ai.score,
      category: ai.category,
      aiPriority: ai.score >= 80 ? 'HOT' : (ai.score >= 50 ? 'WARM' : 'COLD'),
      recommendation: ai.recommendation,
      aiSummary: ai.recommendation,
      recommendedAction: ai.recommendation,
      isNew: true,
      status: 'NEW',
      date: dateStr
    };
  }

  // Save to localStorage cleanly without duplicate phone numbers
  const localEnquiries = getStoredEnquiries();
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
  const filteredLocal = localEnquiries.filter(e => {
    const p = (e.phone || '').replace(/[^0-9]/g, '').slice(-10);
    return e.id !== savedRecord.id && (!cleanPhone || p !== cleanPhone);
  });
  filteredLocal.unshift(savedRecord);
  localStorage.setItem('vels_enquiries', JSON.stringify(filteredLocal));

  alert(`Thank you, ${name}!\n\nYour enquiry has been received. Our project engineer in ${location} will get in touch with you shortly at +91 ${phone} to confirm your site visit and plot layout details.`);
  
  if (e.target && e.target.reset) {
    e.target.reset();
  }

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
  fetch('/api/admin/reset', { method: 'POST' }).catch(() => {});
  filterEnquiriesTable('ALL');
  alert('Client enquiries reset to default AI Scored sample dataset.');
}

async function markEnquiryAsRead(id, newStatus = 'READ') {
  try {
    await fetch(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (err) {
    console.log('Failed to update status on server:', err);
  }

  try {
    const list = JSON.parse(localStorage.getItem('vels_enquiries')) || [];
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      list[idx].status = newStatus;
      list[idx].isNew = false;
      localStorage.setItem('vels_enquiries', JSON.stringify(list));
    }
  } catch (e) {}

  renderAdminEnquiries();
}

async function renderAdminEnquiries(filterCat = activeEnquiryFilter) {
  const tbody = document.getElementById('admin-enquiry-table-body');
  if (!tbody) return;

  let enquiries = [];

  // 1. Fetch Backend Database Enquiries (Primary Source of Truth)
  try {
    const res = await fetch('/api/admin/enquiries');
    const data = await res.json();
    if (data.success && Array.isArray(data.leads)) {
      const backendLeads = data.leads.map(lead => ({
        id: lead.id,
        name: lead.customerName || lead.name || 'Anonymous',
        customerName: lead.customerName || lead.name || 'Anonymous',
        phone: lead.phone || 'N/A',
        email: lead.email || 'N/A',
        location: lead.project || 'Coimbatore & Pollachi',
        project: lead.project || 'Coimbatore & Pollachi',
        purpose: lead.paymentMode || 'Residential Construction',
        paymentMode: lead.paymentMode || 'Residential Construction',
        timeline: lead.timeline || 'Within 30 Days',
        budget: lead.budget || '₹25 Lakhs - ₹50 Lakhs',
        plot: lead.plotNumber || lead.plot || 'General Layout',
        plotNumber: lead.plotNumber || lead.plot || 'General Layout',
        message: lead.message || 'Enquiry received.',
        score: lead.aiScore || lead.score || 50,
        aiScore: lead.aiScore || lead.score || 50,
        category: lead.aiPriority ? `${lead.aiPriority} LEAD` : 'WARM LEAD',
        aiPriority: lead.aiPriority || 'WARM',
        recommendation: (lead.aiSummary || lead.recommendedAction || lead.recommendation || '').replace(/[🔥⚡❄️]/g, '').trim(),
        aiSummary: lead.aiSummary || lead.recommendation || '',
        recommendedAction: lead.recommendedAction || lead.recommendation || '',
        status: lead.status || 'NEW',
        isNew: lead.status === 'NEW' || lead.isNew === true,
        date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'
      }));

      // Start with backend leads
      enquiries = [...backendLeads];

      // De-duplicate local storage leads against backend (match by clean phone or ID)
      const localList = getStoredEnquiries();
      const existingPhoneSet = new Set(backendLeads.map(l => (l.phone || '').replace(/[^0-9]/g, '').slice(-10)));
      const existingIdSet = new Set(backendLeads.map(l => l.id));

      localList.forEach(localLead => {
        const cleanP = (localLead.phone || '').replace(/[^0-9]/g, '').slice(-10);
        if (!existingIdSet.has(localLead.id) && cleanP && !existingPhoneSet.has(cleanP)) {
          enquiries.push(localLead);
        }
      });

      // Update localStorage with de-duplicated list
      localStorage.setItem('vels_enquiries', JSON.stringify(enquiries));
    } else {
      enquiries = getStoredEnquiries();
    }
  } catch (err) {
    console.log('Using local dataset for admin table rendering.');
    enquiries = getStoredEnquiries();
  }

  // SORT DESCENDING BY AI SCORE (HIGHEST PRIORITY CALL FIRST!)
  enquiries.sort((a, b) => (b.score || b.aiScore || 0) - (a.score || a.aiScore || 0));

  let hotCount = 0;
  let warmCount = 0;
  let coldCount = 0;

  let hotNewCount = 0;
  let warmNewCount = 0;
  let coldNewCount = 0;

  enquiries.forEach(enq => {
    const s = enq.score || enq.aiScore || 50;
    const isNew = enq.status === 'NEW' || enq.isNew === true;

    if (s >= 80) {
      hotCount++;
      if (isNew) hotNewCount++;
    } else if (s >= 50) {
      warmCount++;
      if (isNew) warmNewCount++;
    } else {
      coldCount++;
      if (isNew) coldNewCount++;
    }
  });

  const totalNewCount = hotNewCount + warmNewCount + coldNewCount;

  const elHot = document.getElementById('count-hot-leads');
  const elWarm = document.getElementById('count-warm-leads');
  const elCold = document.getElementById('count-cold-leads');
  const elTopScore = document.getElementById('count-top-score');

  if (elHot) elHot.textContent = hotCount;
  if (elWarm) elWarm.textContent = warmCount;
  if (elCold) elCold.textContent = coldCount;
  if (elTopScore && enquiries.length > 0) {
    elTopScore.textContent = `${enquiries[0].score || enquiries[0].aiScore}/100`;
  }

  // --- UPDATE NEW ENQUIRY BADGES ON CARDS ---
  const bHot = document.getElementById('badge-hot-new');
  if (bHot) {
    if (hotNewCount > 0) {
      bHot.style.display = 'inline-block';
      bHot.textContent = `(${hotNewCount} NEW)`;
    } else {
      bHot.style.display = 'none';
    }
  }

  const bWarm = document.getElementById('badge-warm-new');
  if (bWarm) {
    if (warmNewCount > 0) {
      bWarm.style.display = 'inline-block';
      bWarm.textContent = `(${warmNewCount} NEW)`;
    } else {
      bWarm.style.display = 'none';
    }
  }

  const bCold = document.getElementById('badge-cold-new');
  if (bCold) {
    if (coldNewCount > 0) {
      bCold.style.display = 'inline-block';
      bCold.textContent = `(${coldNewCount} NEW)`;
    } else {
      bCold.style.display = 'none';
    }
  }

  // --- UPDATE NEW ENQUIRY BADGES ON FILTER CHIPS ---
  const cAll = document.getElementById('chip-badge-all');
  if (cAll) {
    if (totalNewCount > 0) {
      cAll.style.display = 'inline-block';
      cAll.textContent = `(${totalNewCount} NEW)`;
    } else {
      cAll.style.display = 'none';
    }
  }

  const cHot = document.getElementById('chip-badge-hot');
  if (cHot) {
    if (hotNewCount > 0) {
      cHot.style.display = 'inline-block';
      cHot.textContent = `(${hotNewCount} NEW)`;
    } else {
      cHot.style.display = 'none';
    }
  }

  const cWarm = document.getElementById('chip-badge-warm');
  if (cWarm) {
    if (warmNewCount > 0) {
      cWarm.style.display = 'inline-block';
      cWarm.textContent = `(${warmNewCount} NEW)`;
    } else {
      cWarm.style.display = 'none';
    }
  }

  const cCold = document.getElementById('chip-badge-cold');
  if (cCold) {
    if (coldNewCount > 0) {
      cCold.style.display = 'inline-block';
      cCold.textContent = `(${coldNewCount} NEW)`;
    } else {
      cCold.style.display = 'none';
    }
  }

  let filtered = enquiries;
  if (filterCat === 'HOT') filtered = enquiries.filter(e => (e.score || e.aiScore) >= 80);
  else if (filterCat === 'WARM') filtered = enquiries.filter(e => (e.score || e.aiScore) >= 50 && (e.score || e.aiScore) < 80);
  else if (filterCat === 'COLD') filtered = enquiries.filter(e => (e.score || e.aiScore) < 50);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-secondary);">No scored enquiries found for filter [${filterCat}].</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((enq, idx) => {
    const scoreVal = enq.score || enq.aiScore || 50;
    const isUnread = enq.status === 'NEW' || enq.isNew === true;

    let badgeClass = 'badge-available';
    let badgeStyle = 'background: rgba(60, 90, 120, 0.12); color: #3c5a78; border: 1px solid #3c5a78; font-weight: 700;';
    let barColor = '#3c5a78';

    if (scoreVal >= 80) {
      badgeClass = 'badge-sold';
      badgeStyle = 'background: rgba(217, 83, 79, 0.15); color: #d9534f; border: 1px solid #d9534f; font-weight: 800;';
      barColor = '#d9534f';
    } else if (scoreVal >= 50) {
      badgeClass = 'badge-prebooked';
      badgeStyle = 'background: rgba(198, 161, 91, 0.15); color: var(--gold-antique); border: 1px solid var(--gold-primary); font-weight: 700;';
      barColor = '#C6A15B';
    }

function formatPointwiseRecommendation(rawText) {
  if (!rawText) return '<span style="color: #666666;">No AI signals generated.</span>';

  let cleanText = rawText.replace(/[🔥⚡❄️]/g, '').trim();
  let title = '';
  let points = [];

  if (cleanText.includes(':')) {
    const parts = cleanText.split(':');
    title = parts[0].trim();
    const rest = parts.slice(1).join(':').trim();
    points = rest.split(/•|;|\|/).map(p => p.trim()).filter(Boolean);
  } else {
    points = cleanText.split(/•|;|\|/).map(p => p.trim()).filter(Boolean);
  }

  if (points.length === 0 && title) {
    points = [title];
    title = '';
  }

  let html = '';
  if (title) {
    html += `<div style="font-weight: 800; color: #0A4B32; font-size: 0.8rem; margin-bottom: 6px; border-bottom: 1px dashed rgba(198,161,91,0.4); padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${title}</div>`;
  }

  if (points.length > 0) {
    html += `<ul>`;
    points.forEach(pt => {
      html += `<li>${pt}</li>`;
    });
    html += `</ul>`;
  } else {
    html += `<div style="font-size: 0.8rem; color: #1E2719;">${cleanText}</div>`;
  }

  return html;
}

    const categoryText = (enq.category || enq.aiPriority || '').replace(/[🔥⚡❄️]/g, '').trim();
    const recommendationText = (enq.recommendation || enq.aiSummary || enq.recommendedAction || '').replace(/[🔥⚡❄️]/g, '').trim();
    const cleanPhone = (enq.phone || '').replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hello ${enq.name || enq.customerName}, following up from VELS Sakthivel Groups regarding your plot enquiry for ${enq.plot || enq.plotNumber}.`);

    return `
      <tr style="border-bottom: 1px solid #E2D9C5; ${isUnread ? 'background: rgba(217, 83, 79, 0.03);' : ''}">
        <td style="padding: 16px 14px; vertical-align: top;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <strong style="font-size: 1.25rem; font-weight: 800; color: #1E2719;">${scoreVal}</strong>
            <span style="font-size: 0.75rem; color: #666666;">/ 100</span>
          </div>
          <div style="width: 90px; height: 5px; background: rgba(0,0,0,0.08); border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${scoreVal}%; height: 100%; background: ${barColor};"></div>
          </div>
          <span class="badge-status ${badgeClass}" style="${badgeStyle}">${categoryText}</span>
        </td>
        <td style="padding: 16px 14px; vertical-align: top;">
          <strong style="font-size: 0.95rem; color: #1E2719; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            ${enq.name || enq.customerName}
            ${isUnread ? `<span class="row-new-badge" onclick="markEnquiryAsRead('${enq.id}', 'READ')" title="Click to mark as read">NEW</span>` : ''}
          </strong>
          <div style="font-size: 0.85rem; font-weight: 600; color: #1E2719; margin-top: 3px;">Phone: ${enq.phone}</div>
          <div style="font-size: 0.78rem; color: #4A5568; margin-top: 2px;">Email: ${enq.email || 'N/A'}</div>
          <div style="font-size: 0.72rem; color: #718096; margin-top: 4px;">Date: ${enq.date || 'Today'}</div>
        </td>
        <td style="padding: 16px 14px; vertical-align: top;">
          <strong style="font-size: 0.88rem; color: #1E2719; display: block; margin-bottom: 3px;">Location: ${enq.location || enq.project}</strong>
          <div style="font-size: 0.85rem; font-weight: 600; color: #1E2719; margin-top: 2px;">Budget: ${enq.budget}</div>
          <div style="font-size: 0.78rem; color: #4A5568; margin-top: 2px;">Purpose: ${enq.purpose || enq.paymentMode}</div>
        </td>
        <td style="padding: 16px 14px; vertical-align: top;">
          <strong style="font-size: 0.85rem; color: #1E2719; display: block; margin-bottom: 3px;">Timeline: ${enq.timeline}</strong>
          <div style="font-size: 0.82rem; font-weight: 600; color: #1E2719; margin-top: 3px;">Target Plot: ${enq.plot || enq.plotNumber}</div>
        </td>
        <td style="padding: 16px 14px; vertical-align: top; min-width: 260px;">
          <div class="ai-recommendation-box">
            ${formatPointwiseRecommendation(recommendationText)}
          </div>
        </td>
        <td style="padding: 16px 14px; vertical-align: top;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${isUnread ? `
              <button onclick="markEnquiryAsRead('${enq.id}', 'READ')" class="btn" style="font-size: 0.72rem; padding: 7px 10px; background: linear-gradient(135deg, #D9534F 0%, #B52B27 100%); color: #FFFFFF; border: none; border-radius: 4px; font-weight: 800; cursor: pointer; letter-spacing: 0.5px; box-shadow: 0 2px 6px rgba(217, 83, 79, 0.3);">
                MARK AS READ ✓
              </button>
            ` : `
              <span style="font-size: 0.7rem; font-weight: 700; color: #0A5C36; padding: 5px 8px; background: rgba(10,92,54,0.08); border: 1px solid rgba(10,92,54,0.2); border-radius: 4px; text-align: center;">
                ✓ READ / OPENED
              </span>
            `}
            <a href="https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${waText}" onclick="markEnquiryAsRead('${enq.id}', 'CONTACTED')" target="_blank" rel="noopener" class="btn" style="font-size: 0.72rem; padding: 8px 12px; background: linear-gradient(135deg, #0A5C36 0%, #064E2E 100%); border: 1px solid #0A5C36; color: #FFFDF8; text-align: center; text-decoration: none; border-radius: 4px; font-weight: 700; letter-spacing: 0.8px; box-shadow: 0 3px 10px rgba(10, 92, 54, 0.25);">
              WHATSAPP LEAD
            </a>
            <a href="tel:${enq.phone}" onclick="markEnquiryAsRead('${enq.id}', 'CONTACTED')" class="btn" style="font-size: 0.72rem; padding: 8px 12px; background: transparent; border: 1px solid var(--gold-primary); color: var(--gold-antique); text-align: center; text-decoration: none; border-radius: 4px; font-weight: 700; letter-spacing: 0.8px; transition: all 0.3s ease;">
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

// Helper function to render a dense, detailed 80-100 plot masterplan layout SVG
function generateRichMasterplanSVG(prefix, highwayName, boulevardName) {
  let svg = `<svg width="100%" height="auto" viewBox="0 0 850 440" style="background: #F4EFE4; border-radius: 6px; display: block; min-width: 780px;">`;
  
  // Top Highway
  svg += `<rect x="15" y="10" width="820" height="34" fill="#283322" rx="4"/>`;
  svg += `<line x1="15" y1="27" x2="835" y2="27" stroke="#C6A15B" stroke-dasharray="8 6" stroke-width="1.5"/>`;
  svg += `<text x="425" y="22" font-family="monospace" font-size="10.5" fill="#F7F1E3" text-anchor="middle" font-weight="bold" letter-spacing="2">${highwayName}</text>`;
  
  // Central Main Boulevard (Horizontal)
  svg += `<rect x="15" y="210" width="820" height="28" fill="#39452F"/>`;
  svg += `<text x="425" y="228" font-family="monospace" font-size="9.5" fill="#F7F1E3" text-anchor="middle" letter-spacing="2">${boulevardName}</text>`;
  
  // Central Avenue Street (Vertical)
  svg += `<rect x="410" y="44" width="30" height="385" fill="#39452F"/>`;
  
  // Entrance Gate Marker
  svg += `<rect x="402" y="44" width="46" height="8" fill="#C6A15B" rx="2"/>`;
  svg += `<text x="425" y="40" font-family="monospace" font-size="7.5" fill="#283322" text-anchor="middle" font-weight="bold">GRAND ARCH ENTRY</text>`;
  
  // Helper to render quadrant grid of plots
  function renderBlock(startX, startY, rows, cols, startNum, isBlockC = false) {
    let blockSvg = '';
    let currentNum = startNum;
    let w = 48, h = 42, dx = 53, dy = 47;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let x = startX + c * dx;
        let y = startY + r * dy;
        
        if (isBlockC && r === 2 && c >= 4) {
          if (c === 4 && r === 2) {
            blockSvg += `<rect x="${x}" y="${y}" width="${3 * dx - 5}" height="${h}" fill="#587045" stroke="#283322" rx="4"/>`;
            blockSvg += `<text x="${x + (3 * dx - 5) / 2}" y="${y + 25}" font-family="monospace" font-size="9" fill="#F7F1E3" text-anchor="middle" font-weight="bold">🌳 GREEN PARK & PLAY ZONE</text>`;
          }
          continue;
        }
        
        let pId = `${prefix}-${currentNum}`;
        currentNum++;
        
        let fill = 'rgba(57, 69, 47, 0.92)';
        let stroke = '#1E2719';
        let textFill = '#FFFDF7';
        let fontW = 'bold';
        
        if (currentNum % 5 === 0) {
          fill = 'rgba(198, 161, 91, 0.98)';
          stroke = '#806227';
          textFill = '#1A2216';
          fontW = 'bold';
        } else if (currentNum % 7 === 0 || currentNum % 11 === 0) {
          fill = 'rgba(168, 102, 75, 0.95)';
          stroke = '#61321F';
          textFill = '#FFFDF7';
          fontW = 'bold';
        }
        
        blockSvg += `<g class="plot-item">`;
        blockSvg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="1.3" rx="3" class="plot-rect"/>`;
        blockSvg += `<text x="${x + w/2}" y="${y + h/2 + 3.5}" font-family="monospace" font-size="9.5" fill="${textFill}" font-weight="${fontW}" text-anchor="middle">${pId}</text>`;
        blockSvg += `</g>`;
      }
    }
    return blockSvg;
  }
  
  svg += renderBlock(35, 54, 3, 7, 101);
  svg += renderBlock(455, 54, 3, 7, 122);
  svg += renderBlock(35, 248, 3, 7, 143, true);
  svg += renderBlock(455, 248, 3, 7, 161);
  
  svg += `</svg>`;
  return svg;
}

// --- 4 LOCATION MASTERPLAN DATASET & INTERACTIVE MODAL INSPECTOR ---
const LOCATION_MASTERPLANS = {
  coimbatore: {
    city: 'Coimbatore',
    tag: 'AIRPORT & HIGHWAY CORRIDOR',
    title: 'VELS Heritage & Peelamedu Park Enclave',
    subtitle: 'Coimbatore Airport Corridor • Hope College Main Road',
    approval: '100% DTCP & RERA Approved',
    totalPlots: '145 DTCP Plots',
    available: 95,
    prebooked: 18,
    sold: 32,
    plotSizes: '2.50 to 6.00 Cents',
    dimensions: "30'×40', 30'×50', 40'×60'",
    roadWidths: '40 FT & 30 FT Heavy Tar Roads',
    startingPrice: '₹ 24.50 Lakhs',
    highlights: 'Located on Hope College Main Road near Coimbatore International Airport. Features 40ft & 30ft asphalt roads, underground drainage, solar street lights, gated security kiosk, and instant bank loan approval.',
    get svgBlueprint() {
      return generateRichMasterplanSVG('C', '50 FT COIMBATORE AIRPORT CORRIDOR HIGHWAY', '40 FT PEELAMEDU MAIN BOULEVARD');
    }
  },
  pollachi: {
    city: 'Pollachi',
    tag: 'FLAGSHIP GATED COMMUNITY',
    title: 'VELS Golden Vistas & Mahalingapuram',
    subtitle: 'Mahalingapuram Main Road Corridor • Anamalai View Zone',
    approval: '100% DTCP Approved',
    totalPlots: '228 DTCP Plots',
    available: 135,
    prebooked: 32,
    sold: 61,
    plotSizes: '2.06 to 5.00 Cents',
    dimensions: "30'×30', 30'×40', 30'×50'",
    roadWidths: '40 FT Main Boulevard Road',
    startingPrice: '₹ 21.60 Lakhs',
    highlights: 'Flagship project in Pollachi Mahalingapuram with 40ft heavy compaction roads, 10% dedicated open park space, royal palm avenues, and panoramic Anamalai mountain views.',
    get svgBlueprint() {
      return generateRichMasterplanSVG('P', '40 FT MAHALINGAPURAM STATE HIGHWAY', '40 FT ANAMALAI VIEW BOULEVARD');
    }
  },
  madurai: {
    city: 'Madurai',
    tag: 'AIIMS & RING ROAD CORRIDOR',
    title: 'VELS Temple City Heights & Ring Road',
    subtitle: 'Madurai AIIMS Corridor • Mattuthavani Access Zone',
    approval: 'DTCP & RERA Approved',
    totalPlots: '160 DTCP Plots',
    available: 110,
    prebooked: 22,
    sold: 28,
    plotSizes: '3.00 to 8.00 Cents',
    dimensions: "30'×45', 40'×60', 50'×70'",
    roadWidths: '40 FT Heavy Tar Highways',
    startingPrice: '₹ 28.00 Lakhs',
    highlights: 'Strategically located on Madurai Ring Road & AIIMS Hospital Corridor. Designed for rapid asset appreciation, 40ft wide internal tar avenues, and complete clear parent deed documentation.',
    get svgBlueprint() {
      return generateRichMasterplanSVG('M', '50 FT MADURAI RING ROAD EXPRESSWAY', '40 FT AIIMS HOSPITAL AVENUE');
    }
  },
  chennai: {
    city: 'Chennai',
    tag: 'ECR BAY & GST METRO CORRIDOR',
    title: 'VELS ECR Bay Vistas & GST Smart Layout',
    subtitle: 'Chennai East Coast Road & GST Metro Extension',
    approval: 'CMDA & RERA Approved',
    totalPlots: '195 CMDA Plots',
    available: 120,
    prebooked: 35,
    sold: 40,
    plotSizes: '2.50 to 10.00 Cents',
    dimensions: "30'×40', 40'×60', 50'×80'",
    roadWidths: '50 FT Avenue & 40 FT Boulevards',
    startingPrice: '₹ 45.00 Lakhs',
    highlights: 'Coastal gated enclave near Chennai ECR & GST Metro extension. CMDA approved masterplan layout featuring 50ft avenues, underground power cables, rainwater runoff systems, and sea breeze environment.',
    get svgBlueprint() {
      return generateRichMasterplanSVG('CH', '50 FT CHENNAI ECR BEACH BOULEVARD', '40 FT GST METRO EXTENSION AVENUE');
    }
  }
};

function openLocationMasterplanModal(cityKey) {
  const data = LOCATION_MASTERPLANS[cityKey];
  if (!data) return;

  const modal = document.getElementById('location-masterplan-modal');
  if (!modal) return;

  document.getElementById('loc-modal-tag').textContent = `${data.city.toUpperCase()} — ${data.tag}`;
  document.getElementById('loc-modal-title').textContent = data.title;
  document.getElementById('loc-modal-subtitle').textContent = `${data.subtitle} • ${data.approval}`;
  document.getElementById('loc-modal-blueprint-title').textContent = `MASTER PLAN BLUEPRINT — ${data.totalPlots} (${data.city.toUpperCase()})`;

  const svgWrap = document.getElementById('loc-modal-svg-wrap');
  if (svgWrap) svgWrap.innerHTML = data.svgBlueprint;

  const badgesWrap = document.getElementById('loc-modal-status-badges');
  if (badgesWrap) {
    badgesWrap.innerHTML = `
      <span class="badge-status badge-available" style="padding: 6px 14px; font-size: 0.76rem;">${data.available} AVAILABLE</span>
      <span class="badge-status badge-prebooked" style="padding: 6px 14px; font-size: 0.76rem;">${data.prebooked} PRE-BOOKED</span>
      <span class="badge-status badge-sold" style="padding: 6px 14px; font-size: 0.76rem;">${data.sold} SOLD</span>
    `;
  }

  const specsGrid = document.getElementById('loc-modal-specs-grid');
  if (specsGrid) {
    specsGrid.innerHTML = `
      <div class="project-spec-item">
        <span class="project-spec-label">TOTAL LAYOUT</span>
        <span class="project-spec-val">${data.totalPlots}</span>
      </div>
      <div class="project-spec-item">
        <span class="project-spec-label">PLOT SIZES</span>
        <span class="project-spec-val">${data.plotSizes}</span>
      </div>
      <div class="project-spec-item">
        <span class="project-spec-label">STANDARD DIMENSIONS</span>
        <span class="project-spec-val">${data.dimensions}</span>
      </div>
      <div class="project-spec-item">
        <span class="project-spec-label">ROAD WIDTHS</span>
        <span class="project-spec-val">${data.roadWidths}</span>
      </div>
      <div class="project-spec-item">
        <span class="project-spec-label">APPROVAL STATUS</span>
        <span class="project-spec-val text-gold">${data.approval}</span>
      </div>
      <div class="project-spec-item">
        <span class="project-spec-label">STARTING PRICE</span>
        <span class="project-spec-val text-gold">${data.startingPrice}</span>
      </div>
    `;
  }

  const highlightsEl = document.getElementById('loc-modal-highlights');
  if (highlightsEl) highlightsEl.textContent = data.highlights;

  const exploreBtn = document.getElementById('loc-modal-explore-btn');
  if (exploreBtn) exploreBtn.href = `plots.html?location=${encodeURIComponent(data.city)}`;

  const enquireBtn = document.getElementById('loc-modal-enquire-btn');
  if (enquireBtn) enquireBtn.href = `contact.html?location=${encodeURIComponent(data.city)}&project=${encodeURIComponent(data.title)}`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLocationMasterplanModal() {
  const modal = document.getElementById('location-masterplan-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

