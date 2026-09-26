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

  // Sectorized Sub-Blocks (A, B, C, D, E, F) - Strictly x=30..710 (Zero overlap with Park zones x=760..955)
  const blocks = [
    // Sector A (North West 1): x=30..220, y=35..325
    { sector: 'A', xStart: 30,  yStart: 35,  cols: 5, rows: 4, colGap: 36, rowGap: 68, width: 30, height: 52 },
    // Sector B (North Center 2): x=285..475, y=35..325
    { sector: 'B', xStart: 285, yStart: 35,  cols: 5, rows: 4, colGap: 36, rowGap: 68, width: 30, height: 52 },
    // Sector C (North East 3): x=530..710, y=35..325
    { sector: 'C', xStart: 530, yStart: 35,  cols: 5, rows: 4, colGap: 36, rowGap: 68, width: 30, height: 52 },

    // Sector D (South West 1): x=30..220, y=405..695
    { sector: 'D', xStart: 30,  yStart: 405, cols: 5, rows: 4, colGap: 36, rowGap: 68, width: 30, height: 52 },
    // Sector E (South Center 2): x=285..475, y=405..695
    { sector: 'E', xStart: 285, yStart: 405, cols: 5, rows: 4, colGap: 36, rowGap: 68, width: 30, height: 52 },
    // Sector F (South East 3): x=530..710, y=405..695
    { sector: 'F', xStart: 530, yStart: 405, cols: 5, rows: 4, colGap: 36, rowGap: 68, width: 30, height: 52 }
  ];

  const plots = [];
  let plotCounter = 0;

  for (let b = 0; b < blocks.length; b++) {
    const blk = blocks[b];
    let sectorPlotNum = 1;
    for (let r = 0; r < blk.rows; r++) {
      for (let c = 0; c < blk.cols; c++) {
        if (plotCounter >= totalPlots) break;

        const plotNum = plotCounter + 1;
        const x = blk.xStart + c * blk.colGap;
        const y = blk.yStart + r * blk.rowGap;

        const spec = centsList[plotCounter % centsList.length];
        const facing = (c === 0 || c === blk.cols - 1 || r === 0) ? 'Corner Facing' : facings[plotCounter % (facings.length - 1)];
        const road = roadNames[b % roadNames.length];
        const status = statusList[plotCounter % statusList.length];

        plots.push({
          id: `PLOT-${plotNum}`,
          number: plotNum,
          sector: blk.sector,
          sectorPlot: `${blk.sector}${sectorPlotNum}`,
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
        sectorPlotNum++;
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
  if (document.getElementById('admin-customer-registry-tbody')) {
    renderCustomerDirectoryTable();
  }

  initReplayButton();
  initSelectedPlotUrlParams();
  initGalleryModal();
  initGalleryFilter();
  if (document.getElementById('customer-reviews-section')) {
    initCustomerReviewsSlider();
  }
  initTextured3DBackground();
  initHeroStatCounters();
  if (document.getElementById('admin-main-dashboard')) {
    checkAdminAuth();
  }
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

    if (typeof renderAdminTable === 'function') {
      renderAdminTable();
      updateAdminMetrics();
    }
    if (typeof renderAdminEnquiries === 'function') {
      renderAdminEnquiries();
    }
    if (typeof renderCustomerDirectoryTable === 'function') {
      renderCustomerDirectoryTable();
    }
    if (typeof initAdminTabs === 'function') {
      initAdminTabs();
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
  const errorEl = document.getElementById('admin-login-error');

  const validUsername = 'admin';
  const isValidPassword = passInput === 'Admin123' || passInput === 'admin123' || passInput === 'VelsAdmin@2026!';

  if (userInput === validUsername && isValidPassword) {
    sessionStorage.setItem('vels_admin_authenticated', 'true');
    if (errorEl) errorEl.style.display = 'none';
    checkAdminAuth();
  } else {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'Invalid admin credentials. Access denied.';
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
    g.setAttribute('style', 'cursor: pointer; transition: transform 0.2s ease;');
    if (isFilteredOut) {
      g.setAttribute('opacity', '0.15');
    }

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', plot.x);
    rect.setAttribute('y', plot.y);
    rect.setAttribute('width', plot.w);
    rect.setAttribute('height', plot.h);
    rect.setAttribute('rx', '3');
    rect.setAttribute('class', `plot-rect ${statusClass} ${isSelected ? 'selected' : ''}`);
    
    // Realistic 3D Plot Status & Lawn Grass Fill Styling
    if (plot.status === 'AVAILABLE') {
      rect.setAttribute('fill', 'url(#plot-grass-pattern)');
      rect.setAttribute('stroke', '#33691e');
      rect.setAttribute('stroke-width', '1.4');
    } else if (plot.status === 'PRE-BOOKED') {
      rect.setAttribute('fill', 'url(#plot-gold-grad)');
      rect.setAttribute('stroke', '#f57f17');
      rect.setAttribute('stroke-width', '1.4');
    } else if (plot.status === 'SOLD') {
      rect.setAttribute('fill', 'url(#plot-terracotta-grad)');
      rect.setAttribute('stroke', '#bf360c');
      rect.setAttribute('stroke-width', '1.4');
    }

    if (isSelected) {
      rect.setAttribute('stroke', '#ffffff');
      rect.setAttribute('stroke-width', '3');
      rect.setAttribute('filter', 'drop-shadow(0 0 12px #ffffff)');
    }

    rect.addEventListener('click', () => {
      selectPlot(plot.id);
    });

    // Plot Number Circle Badge Background for Maximum Legibility Over Grass
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', plot.x + plot.w / 2);
    circle.setAttribute('cy', plot.y + plot.h / 2);
    circle.setAttribute('r', '8.5');
    if (plot.status === 'AVAILABLE') {
      circle.setAttribute('fill', '#1b2416');
      circle.setAttribute('stroke', '#c6a15b');
      circle.setAttribute('stroke-width', '1');
    } else if (plot.status === 'PRE-BOOKED') {
      circle.setAttribute('fill', '#37474f');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '1');
    } else {
      circle.setAttribute('fill', '#260e04');
      circle.setAttribute('stroke', '#ff8a65');
      circle.setAttribute('stroke-width', '1');
    }
    circle.setAttribute('style', 'pointer-events: none;');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', plot.x + plot.w / 2);
    text.setAttribute('y', plot.y + plot.h / 2 + 3.5);
    text.setAttribute('class', `plot-text ${plot.status === 'PRE-BOOKED' ? 'text-dark' : ''}`);
    text.setAttribute('font-family', 'sans-serif');
    text.setAttribute('font-size', '9');
    text.setAttribute('font-weight', '900');
    text.setAttribute('fill', '#ffffff');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('style', 'pointer-events: none;');
    text.textContent = `${plot.number}`;

    g.appendChild(rect);
    g.appendChild(circle);
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

  // Populate Edit Form Inputs
  const editStatusEl = document.getElementById('edit-plot-status');
  if (editStatusEl) editStatusEl.value = plot.status;

  const editFacingEl = document.getElementById('edit-plot-facing');
  if (editFacingEl) editFacingEl.value = plot.facing;

  const editDimEl = document.getElementById('edit-plot-dim');
  if (editDimEl) editDimEl.value = plot.dim;

  const editPriceEl = document.getElementById('edit-plot-price');
  if (editPriceEl) editPriceEl.value = plot.price;

  const enquireBtn = document.getElementById('enquire-plot-btn');
  if (enquireBtn) {
    enquireBtn.onclick = () => {
      window.location.href = `contact.html?plot=${encodeURIComponent(`Plot #${plot.number} (${plot.cents} / ${plot.size}, ${plot.dim}, ${plot.facing}) - ${plot.price}`)}`;
    };
  }

  openDrawer();
}

function togglePlotEditForm() {
  const form = document.getElementById('drawer-plot-edit-form');
  if (!form) return;
  if (form.style.display === 'none' || !form.style.display) {
    form.style.display = 'block';
  } else {
    form.style.display = 'none';
  }
}

function handleSavePlotEdit(event) {
  if (event) event.preventDefault();
  if (!selectedPlotId) return;

  const plot = plotDataset.find(p => p.id === selectedPlotId);
  if (!plot) return;

  const newStatus = document.getElementById('edit-plot-status')?.value;
  const newFacing = document.getElementById('edit-plot-facing')?.value;
  const newDim = document.getElementById('edit-plot-dim')?.value.trim();
  const newPrice = document.getElementById('edit-plot-price')?.value.trim();

  if (newStatus) plot.status = newStatus;
  if (newFacing) plot.facing = newFacing;
  if (newDim) plot.dim = newDim;
  if (newPrice) plot.price = newPrice;

  savePlotState();
  selectPlot(selectedPlotId);
  updateAvailabilityCounts();

  const form = document.getElementById('drawer-plot-edit-form');
  if (form) form.style.display = 'none';
}

function savePlotState() {
  try {
    localStorage.setItem('vels_saved_plot_dataset', JSON.stringify(plotDataset));
  } catch (e) {
    console.error('Error saving plot dataset:', e);
  }
}

function loadSavedPlotState() {
  try {
    const saved = localStorage.getItem('vels_saved_plot_dataset');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach(savedPlot => {
          const item = plotDataset.find(p => p.id === savedPlot.id);
          if (item) {
            item.status = savedPlot.status;
            if (savedPlot.facing) item.facing = savedPlot.facing;
            if (savedPlot.dim) item.dim = savedPlot.dim;
            if (savedPlot.price) item.price = savedPlot.price;
          }
        });
      }
    }
  } catch (e) {
    console.error('Error loading plot dataset:', e);
  }
}

// REAL-TIME CROSS-TAB SYNC BETWEEN ADMIN & PLOTS MAP
window.addEventListener('storage', (e) => {
  if (e.key === 'vels_saved_plot_dataset') {
    loadSavedPlotState();
    if (document.getElementById('plot-masterplan-svg')) {
      renderMasterPlanSvg();
      updateAvailabilityCounts();
    }
    if (document.getElementById('admin-plot-table-body')) {
      renderAdminTable();
      updateAdminMetrics();
    }
  }
});

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

  renderPublicPlotsTable();
}

// PUBLIC PLOTS DIRECTORY TABLE FILTERING & PAGINATION
let publicPlotsCurrentPage = 1;
const publicPlotsPageSize = 25;
let publicPlotsSearchQuery = '';
let publicPlotsStatusFilter = 'ALL';

function handlePublicPlotSearch(query) {
  publicPlotsSearchQuery = (query || '').trim().replace(/^#/, '').toLowerCase();
  publicPlotsCurrentPage = 1;
  renderPublicPlotsTable();
}

function filterPublicPlotsTable(status) {
  publicPlotsStatusFilter = status;
  publicPlotsCurrentPage = 1;

  document.querySelectorAll('.public-table-chip').forEach(chip => {
    if (chip.getAttribute('data-table-filter') === status) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  renderPublicPlotsTable();
}

function goToPublicPlotsPage(page) {
  publicPlotsCurrentPage = page;
  renderPublicPlotsTable();
}

function renderPublicPlotsTable() {
  const tbody = document.getElementById('public-plots-tbody');
  if (!tbody) return;

  const countAll = plotDataset.length;
  const countAvail = plotDataset.filter(p => p.status === 'AVAILABLE').length;
  const countBooked = plotDataset.filter(p => p.status === 'PRE-BOOKED').length;
  const countSold = plotDataset.filter(p => p.status === 'SOLD').length;

  const elAll = document.getElementById('pub-count-all');
  if (elAll) elAll.textContent = `(${countAll})`;
  const elAvail = document.getElementById('pub-count-available');
  if (elAvail) elAvail.textContent = `(${countAvail})`;
  const elBooked = document.getElementById('pub-count-prebooked');
  if (elBooked) elBooked.textContent = `(${countBooked})`;
  const elSold = document.getElementById('pub-count-sold');
  if (elSold) elSold.textContent = `(${countSold})`;

  let filteredPlots = plotDataset.filter(plot => {
    const matchSearch = !publicPlotsSearchQuery || String(plot.number).toLowerCase().includes(publicPlotsSearchQuery) || plot.facing.toLowerCase().includes(publicPlotsSearchQuery);
    const matchStatus = publicPlotsStatusFilter === 'ALL' || plot.status === publicPlotsStatusFilter;
    return matchSearch && matchStatus;
  });

  const totalRecords = filteredPlots.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / publicPlotsPageSize));
  if (publicPlotsCurrentPage > totalPages) publicPlotsCurrentPage = totalPages;
  if (publicPlotsCurrentPage < 1) publicPlotsCurrentPage = 1;

  const startIndex = (publicPlotsCurrentPage - 1) * publicPlotsPageSize;
  const endIndex = Math.min(startIndex + publicPlotsPageSize, totalRecords);
  const pagePlots = filteredPlots.slice(startIndex, endIndex);

  const showingEl = document.getElementById('public-plot-showing-count');
  if (showingEl) {
    showingEl.textContent = totalRecords > 0 
      ? `Showing ${startIndex + 1} - ${endIndex} of ${totalRecords} plots`
      : `No plots match the selected filter`;
  }

  tbody.innerHTML = '';

  if (pagePlots.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="8" style="text-align: center; padding: 25px; color: var(--text-muted); font-style: italic;">No plots match the selected category filter.</td>`;
    tbody.appendChild(tr);
  } else {
    pagePlots.forEach(plot => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
          selectPlot(plot.id);
          document.getElementById('plot-map-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };

      let badgeStyle = 'background: rgba(57, 69, 47, 0.12); color: #2e382b; border: 1px solid rgba(57, 69, 47, 0.3);';
      if (plot.status === 'PRE-BOOKED') {
        badgeStyle = 'background: rgba(198, 161, 91, 0.18); color: #7a5b15; border: 1px solid rgba(198, 161, 91, 0.4);';
      } else if (plot.status === 'SOLD') {
        badgeStyle = 'background: rgba(191, 54, 12, 0.12); color: #bf360c; border: 1px solid rgba(191, 54, 12, 0.3);';
      }

      tr.innerHTML = `
        <td><strong style="color: var(--olive-deep);">Plot #${plot.number}</strong></td>
        <td><strong>${plot.dim}</strong></td>
        <td>${plot.cents} (${plot.size})</td>
        <td>${plot.facing}</td>
        <td><span style="font-size: 0.85rem; color: var(--text-secondary);">${plot.road}</span></td>
        <td><strong class="text-gold-antique">${plot.price}</strong></td>
        <td><span style="${badgeStyle} padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">${plot.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-gold" onclick="selectPlot('${plot.id}'); event.stopPropagation();" style="padding: 4px 10px; font-size: 0.78rem;">
            INSPECT
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderPublicPlotsPagination(totalPages);
}

function renderPublicPlotsPagination(totalPages) {
  const container = document.getElementById('public-plots-pagination');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `<div style="display: flex; gap: 6px; align-items: center; justify-content: center; flex-wrap: wrap;">`;

  html += `<button class="pagination-btn ${publicPlotsCurrentPage === 1 ? 'disabled' : ''}" 
            ${publicPlotsCurrentPage === 1 ? 'disabled' : ''} 
            onclick="goToPublicPlotsPage(${publicPlotsCurrentPage - 1})">Prev</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= publicPlotsCurrentPage - 1 && i <= publicPlotsCurrentPage + 1)) {
      html += `<button class="pagination-btn ${i === publicPlotsCurrentPage ? 'active' : ''}" 
                onclick="goToPublicPlotsPage(${i})">${i}</button>`;
    } else if (i === publicPlotsCurrentPage - 2 || i === publicPlotsCurrentPage + 2) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  html += `<button class="pagination-btn ${publicPlotsCurrentPage === totalPages ? 'disabled' : ''}" 
            ${publicPlotsCurrentPage === totalPages ? 'disabled' : ''} 
            onclick="goToPublicPlotsPage(${publicPlotsCurrentPage + 1})">Next</button>`;

  html += `</div>`;
  container.innerHTML = html;
}

// ADMIN PORTAL - PLOT TABLE PAGINATION & FILTER STATE
let adminCurrentPage = 1;
const adminPageSize = 25;
let adminSearchQuery = '';
let adminStatusFilter = 'ALL';

function handleAdminPlotSearch(query) {
  adminSearchQuery = (query || '').trim().toLowerCase();
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

  const cleanQuery = adminSearchQuery.replace(/^(plot|plot\s*#?)\s*/i, '').trim();

  // Filter dataset by search query and status
  let filteredPlots = plotDataset.filter(plot => {
    const numStr = String(plot.number).toLowerCase();
    const idStr = String(plot.id).toLowerCase();
    const secStr = plot.sectorPlot ? String(plot.sectorPlot).toLowerCase() : '';
    
    const matchSearch = !adminSearchQuery || 
                        numStr === cleanQuery || 
                        numStr.includes(adminSearchQuery) || 
                        numStr.includes(cleanQuery) || 
                        idStr.includes(adminSearchQuery) || 
                        secStr.includes(adminSearchQuery);

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
    tr.innerHTML = `<td colspan="6" style="text-align: center; padding: 24px; color: var(--text-secondary); font-weight: 600;">No plots found matching current search or filter criteria.</td>`;
    tbody.appendChild(tr);
  } else {
    pagePlots.forEach((plot, index) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${index * 35}ms`;
      tr.style.borderBottom = '1px solid rgba(198, 161, 91, 0.2)';

      let badgeClass = 'badge-available';
      if (plot.status === 'PRE-BOOKED') badgeClass = 'badge-prebooked';
      if (plot.status === 'SOLD') badgeClass = 'badge-sold';

      tr.innerHTML = `
        <td style="padding: 14px 12px; text-align: center;"><strong style="font-size: 0.95rem; font-weight: 800; color: #1E2719;">PLOT ${plot.number}</strong></td>
        <td style="padding: 14px 12px; color: #2D3748; font-weight: 600; font-size: 0.88rem;">${plot.size} (${plot.cents})</td>
        <td style="padding: 14px 10px; color: #2D3748; font-weight: 600; font-size: 0.88rem;">${plot.facing}</td>
        <td style="padding: 14px 12px; color: #0A5C36; font-weight: 800; font-size: 0.92rem;">${plot.price}</td>
        <td style="padding: 14px 10px; text-align: center;"><span class="badge-status ${badgeClass}" style="font-size: 0.76rem; font-weight: 800; padding: 4px 10px; display: inline-block;">${plot.status}</span></td>
        <td style="padding: 14px 10px; text-align: center;">
          <select onchange="updatePlotStatus('${plot.id}', this.value)" style="padding: 6px 10px; border-radius: 4px; border: 1.5px solid var(--gold-border); font-family: var(--font-body); font-size: 0.82rem; font-weight: 700; background: var(--bg-cream); color: var(--olive-deep); cursor: pointer;">
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

async function handleQuickEnquirySubmit(e) {
  if (e) e.preventDefault();

  const name = document.getElementById('quick-name')?.value?.trim() || '';
  const mobile = document.getElementById('quick-mobile')?.value?.trim() || '';
  const area = document.getElementById('quick-area')?.value?.trim() || 'Coimbatore & Pollachi';
  const plotNo = document.getElementById('quick-plot')?.value?.trim() || 'General Layout Enquiry';
  const desc = document.getElementById('quick-desc')?.value?.trim() || 'Interested in layout plot.';

  if (!name || !mobile) {
    alert('Please fill in your name and mobile number.');
    return;
  }

  const submitBtn = document.getElementById('quick-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>EVALUATING AI SCORE...</span>';
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  let savedRecord = null;

  // 1. Post enquiry to backend server API
  try {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        phone: mobile,
        project: area,
        plotNumber: plotNo,
        message: desc,
        budget: '₹ 25.00 - 40.00 Lakhs',
        timeline: 'Immediate (Within 15 Days)',
        paymentMode: 'Bank Loan / Self Funded',
        siteVisitRequested: true
      })
    });
    const data = await res.json();
    if (data.success && data.lead) {
      const bl = data.lead;
      savedRecord = {
        id: bl.id,
        name: bl.customerName || name,
        customerName: bl.customerName || name,
        phone: bl.phone || mobile,
        email: 'N/A',
        location: bl.project || area,
        project: bl.project || area,
        purpose: 'Plot Purchase / Villa Build',
        paymentMode: 'Bank Loan / Self Funded',
        timeline: 'Immediate (Within 15 Days)',
        budget: '₹ 25.00 - 40.00 Lakhs',
        plot: bl.plotNumber || plotNo,
        plotNumber: bl.plotNumber || plotNo,
        message: bl.message || desc,
        score: bl.aiScore || 85,
        aiScore: bl.aiScore || 85,
        category: `${bl.aiPriority || 'HOT'} LEAD`,
        aiPriority: bl.aiPriority || 'HOT',
        recommendation: (bl.aiSummary || bl.recommendedAction || '').replace(/[🔥⚡❄️]/g, '').trim(),
        aiSummary: bl.aiSummary || '',
        recommendedAction: bl.recommendedAction || '',
        isNew: true,
        status: 'NEW',
        date: dateStr
      };
    }
  } catch (err) {
    console.log('Backend API offline, evaluating AI score locally.');
  }

  if (!savedRecord) {
    const tempEnquiry = { name, phone: mobile, location: area, plot: plotNo, message: desc };
    const ai = calculateAILeadScore(tempEnquiry);
    savedRecord = {
      id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      customerName: name,
      phone: mobile,
      email: 'N/A',
      location: area,
      project: area,
      purpose: 'Plot Purchase / Villa Build',
      paymentMode: 'Bank Loan / Self Funded',
      timeline: 'Immediate',
      budget: '₹ 25.00 - 40.00 Lakhs',
      plot: plotNo || 'General Layout',
      plotNumber: plotNo || 'General Layout',
      message: desc || 'Submitted via Home Quick Enquiry',
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

  // Store in LocalStorage without duplicates
  const localEnquiries = getStoredEnquiries();
  const cleanPhone = (mobile || '').replace(/[^0-9]/g, '').slice(-10);
  const filteredLocal = localEnquiries.filter(e => {
    const p = (e.phone || '').replace(/[^0-9]/g, '').slice(-10);
    return e.id !== savedRecord.id && (!cleanPhone || p !== cleanPhone);
  });
  filteredLocal.unshift(savedRecord);
  localStorage.setItem('vels_enquiries', JSON.stringify(filteredLocal));

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>SUBMIT ENQUIRY</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  }

  alert(`Thank you, ${name}!\n\nYour enquiry for ${plotNo || 'Plot'} in ${area} has been received and evaluated with AI Priority (${savedRecord.aiScore}/100 - ${savedRecord.aiPriority} LEAD).\n\nOur VELS project engineer will contact you shortly at +91 ${mobile}.`);

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
  const cleanId = (id || '').toString().trim();
  
  // 1. Update in LocalStorage immediately
  try {
    const list = getStoredEnquiries();
    list.forEach(e => {
      const eId = (e.id || '').toString().trim();
      const ePhone = (e.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const cPhone = cleanId.replace(/[^0-9]/g, '').slice(-10);
      if (eId === cleanId || (cPhone && cPhone.length >= 7 && ePhone === cPhone)) {
        e.status = newStatus;
        e.isNew = false;
      }
    });
    localStorage.setItem('vels_enquiries', JSON.stringify(list));

    // Save in persistent read status map
    const readMap = JSON.parse(localStorage.getItem('vels_read_status_map') || '{}');
    readMap[cleanId] = newStatus;
    localStorage.setItem('vels_read_status_map', JSON.stringify(readMap));
  } catch (e) {}

  // 2. Send PUT to Server
  try {
    await fetch(`/api/admin/enquiries/${encodeURIComponent(cleanId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (err) {
    console.log('Failed to update status on server:', err);
  }

  // 3. Re-render Admin Enquiries UI
  renderAdminEnquiries();
}

// --- 5 STAFF / AGENT ROSTER MANAGEMENT ENGINE ---
const DEFAULT_STAFF_ROSTER = [
  'Ramesh Kumar (Senior Sales Lead)',
  'Priya Sharma (Client Advisor)',
  'Karthik V (Site Manager)',
  'Anitha Raj (Relationship Manager)',
  'Suresh Babu (Executive Officer)'
];

function getStaffRoster() {
  try {
    const saved = localStorage.getItem('vels_staff_roster');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 5) return parsed;
    }
  } catch (e) {}
  return DEFAULT_STAFF_ROSTER;
}

function toggleStaffManagerModal() {
  const modal = document.getElementById('staff-manager-modal');
  if (!modal) return;
  
  if (modal.style.display === 'none' || !modal.style.display) {
    const currentStaff = getStaffRoster();
    const container = document.getElementById('staff-inputs-container');
    if (container) {
      container.innerHTML = currentStaff.map((staff, idx) => `
        <div>
          <label style="display: block; font-size: 0.72rem; font-weight: 700; color: var(--olive-deep); margin-bottom: 3px;">STAFF MEMBER #${idx + 1}</label>
          <input type="text" class="form-input staff-roster-input" value="${staff}" placeholder="Staff Name ${idx + 1}" required style="padding: 8px 12px; font-size: 0.88rem;" />
        </div>
      `).join('');
    }
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
  }
}

function saveStaffRoster() {
  const inputs = document.querySelectorAll('.staff-roster-input');
  const newRoster = [];
  inputs.forEach(input => {
    const val = input.value.trim();
    if (val) newRoster.push(val);
  });

  if (newRoster.length === 5) {
    localStorage.setItem('vels_staff_roster', JSON.stringify(newRoster));
    toggleStaffManagerModal();
    if (typeof renderAdminEnquiries === 'function') {
      renderAdminEnquiries();
    }
    alert('Staff Roster updated successfully! Dropdowns on all client enquiries have been refreshed.');
  } else {
    alert('Please enter names for all 5 staff members.');
  }
}

function updateEnquiryStaff(enquiryId, selectedStaff) {
  const cleanId = (enquiryId || '').toString().trim();
  
  try {
    const list = getStoredEnquiries();
    list.forEach(e => {
      const eId = (e.id || '').toString().trim();
      const ePhone = (e.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const cPhone = cleanId.replace(/[^0-9]/g, '').slice(-10);
      if (eId === cleanId || (cPhone && cPhone.length >= 7 && ePhone === cPhone)) {
        e.assignedStaff = selectedStaff;
      }
    });
    localStorage.setItem('vels_enquiries', JSON.stringify(list));
  } catch (e) {}

  try {
    const staffMap = JSON.parse(localStorage.getItem('vels_staff_assignment_map') || '{}');
    staffMap[cleanId] = selectedStaff;
    localStorage.setItem('vels_staff_assignment_map', JSON.stringify(staffMap));
  } catch (e) {}

  fetch(`/api/admin/enquiries/${encodeURIComponent(cleanId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedStaff: selectedStaff })
  }).catch(() => {});

  renderAdminEnquiries();
}

async function renderAdminEnquiries(filterCat = activeEnquiryFilter) {
  const tbody = document.getElementById('admin-enquiry-table-body');
  if (!tbody) return;

  let enquiries = [];
  const readMap = JSON.parse(localStorage.getItem('vels_read_status_map') || '{}');
  const staffMap = JSON.parse(localStorage.getItem('vels_staff_assignment_map') || '{}');
  const currentStaffRoster = getStaffRoster();

  // 1. Fetch Backend Database Enquiries (Primary Source of Truth)
  try {
    const res = await fetch('/api/admin/enquiries');
    const data = await res.json();
    if (data.success && Array.isArray(data.leads)) {
      const backendLeads = data.leads.map(lead => {
        const leadId = (lead.id || '').toString().trim();
        const savedStatus = readMap[leadId] || lead.status || 'NEW';
        const isNewFlag = savedStatus === 'NEW';
        return {
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
          status: savedStatus,
          isNew: isNewFlag,
          assignedStaff: lead.assignedStaff || staffMap[leadId] || 'Unassigned',
          date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'
        };
      });

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

  // --- SMOOTH COUNT-UP NUMBER ANIMATION HELPER ---
  if (!window.animateNumberCountUp) {
    window.animateNumberCountUp = function(element, targetNumber, duration = 800, isScore = false) {
      if (!element) return;
      const startNumber = 0;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress * (2 - progress);
        const current = Math.floor(easeProgress * (targetNumber - startNumber) + startNumber);
        
        if (isScore) {
          element.textContent = `${current}/100`;
        } else {
          element.textContent = current;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          if (isScore) {
            element.textContent = `${targetNumber}/100`;
          } else {
            element.textContent = targetNumber;
          }
        }
      }

      requestAnimationFrame(update);
    };
  }

  if (elHot) window.animateNumberCountUp(elHot, hotCount);
  if (elWarm) window.animateNumberCountUp(elWarm, warmCount);
  if (elCold) window.animateNumberCountUp(elCold, coldCount);
  if (elTopScore && enquiries.length > 0) {
    const topVal = parseInt(enquiries[0].score || enquiries[0].aiScore || 98, 10);
    window.animateNumberCountUp(elTopScore, topVal, 800, true);
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
  if (!rawText) return '<span style="color: #718096; font-size: 0.78rem;">No AI signals generated.</span>';

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
    html += `<div style="font-weight: 800; color: #0A4B32; font-size: 0.78rem; margin-bottom: 6px; border-bottom: 1px dashed rgba(198,161,91,0.4); padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${title}</div>`;
  }

  if (points.length > 0) {
    html += `<ul style="margin: 0; padding-left: 15px; font-size: 0.78rem; color: #2D3748; line-height: 1.45;">`;
    points.forEach(pt => {
      html += `<li style="margin-bottom: 4px;">${pt}</li>`;
    });
    html += `</ul>`;
  } else {
    html += `<div style="font-size: 0.78rem; color: #2D3748; line-height: 1.45;">${cleanText}</div>`;
  }

  return html;
}

    const categoryText = (enq.category || enq.aiPriority || '').replace(/[🔥⚡❄️]/g, '').trim();
    const recommendationText = (enq.recommendation || enq.aiSummary || enq.recommendedAction || '').replace(/[🔥⚡❄️]/g, '').trim();
    const cleanPhone = (enq.phone || '').replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hello ${enq.name || enq.customerName}, following up from VELS Sakthivel Groups regarding your plot enquiry for ${enq.plot || enq.plotNumber}.`);

    return `
      <tr style="border-bottom: 1px solid rgba(198, 161, 91, 0.2); ${isUnread ? 'background: rgba(217, 83, 79, 0.03);' : ''}">
        <td style="padding: 16px 12px; vertical-align: top; text-align: center;">
          <div style="display: inline-flex; align-items: baseline; justify-content: center; gap: 4px; margin-bottom: 6px;">
            <strong style="font-size: 1.3rem; font-weight: 800; color: #1E2719; line-height: 1;">${scoreVal}</strong>
            <span style="font-size: 0.75rem; font-weight: 600; color: #718096;">/ 100</span>
          </div>
          <div style="width: 75px; height: 5px; background: rgba(0,0,0,0.08); border-radius: 3px; overflow: hidden; margin: 0 auto 8px auto;">
            <div style="width: ${scoreVal}%; height: 100%; background: ${barColor}; border-radius: 3px;"></div>
          </div>
          <span class="badge-status ${badgeClass}" style="${badgeStyle} font-size: 0.72rem; padding: 4px 8px; display: inline-block;">${categoryText}</span>
        </td>

        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="font-size: 0.95rem; font-weight: 700; color: #1E2719; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span>${enq.name || enq.customerName}</span>
            ${isUnread ? `<span class="row-new-badge" onclick="markEnquiryAsRead('${enq.id}', 'READ')" title="Click to mark as read">NEW</span>` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px; font-size: 0.82rem;">
            <div style="color: #2D3748; font-weight: 600; display: flex; align-items: center; gap: 6px;">
              <span style="color: #718096; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; min-width: 42px;">Phone</span>
              <a href="tel:${enq.phone}" style="color: #0A5C36; text-decoration: none; font-weight: 700;">${enq.phone}</a>
            </div>
            <div style="color: #4A5568; display: flex; align-items: center; gap: 6px;">
              <span style="color: #718096; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; min-width: 42px;">Email</span>
              <span style="color: #2D3748; font-weight: 500; word-break: break-all;" title="${enq.email || 'N/A'}">${enq.email || 'N/A'}</span>
            </div>
            <div style="color: #718096; display: flex; align-items: center; gap: 6px; font-size: 0.76rem;">
              <span style="color: #718096; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; min-width: 42px;">Date</span>
              <span style="color: #4A5568;">${enq.date || 'Today'}</span>
            </div>
          </div>
        </td>

        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem;">
            <div>
              <span style="display: block; font-size: 0.7rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Location</span>
              <span style="font-weight: 700; color: #1E2719; font-size: 0.85rem;">${enq.location || enq.project}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.7rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Budget</span>
              <span style="font-weight: 700; color: #0A5C36; font-size: 0.85rem;">${enq.budget}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.7rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Purpose</span>
              <span style="color: #4A5568; font-weight: 500; font-size: 0.8rem;">${enq.purpose || enq.paymentMode}</span>
            </div>
          </div>
        </td>

        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.82rem;">
            <div>
              <span style="display: block; font-size: 0.7rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Timeline</span>
              <span style="font-weight: 700; color: #1E2719; font-size: 0.83rem;">${enq.timeline}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.7rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Target Plot</span>
              <span style="display: inline-block; padding: 4px 10px; background: rgba(198, 161, 91, 0.15); border: 1px solid #C6A15B; color: #1E2719; font-weight: 800; font-size: 0.78rem; border-radius: 4px; letter-spacing: 0.5px;">
                ${enq.plot || enq.plotNumber}
              </span>
            </div>
          </div>
        </td>

        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <span style="display: block; font-size: 0.7rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">Assigned Agent</span>
            <select onchange="updateEnquiryStaff('${enq.id}', this.value)" style="padding: 6px 8px; border-radius: 4px; border: 1.5px solid var(--gold-border); font-family: var(--font-body); font-size: 0.78rem; font-weight: 700; background: var(--bg-cream); color: var(--olive-deep); cursor: pointer; width: 100%;">
              <option value="Unassigned" ${!enq.assignedStaff || enq.assignedStaff === 'Unassigned' ? 'selected' : ''}>-- Select Staff --</option>
              ${currentStaffRoster.map(s => `<option value="${s}" ${enq.assignedStaff === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            ${enq.assignedStaff && enq.assignedStaff !== 'Unassigned' 
              ? `<span style="font-size: 0.72rem; font-weight: 700; color: #0A5C36; margin-top: 2px; display: inline-flex; align-items: center; gap: 4px;">✓ Handled by ${enq.assignedStaff.split(' ')[0]}</span>`
              : `<span style="font-size: 0.72rem; color: #A8664B; font-weight: 600; margin-top: 2px; display: inline-block;">Pending Staff</span>`
            }
          </div>
        </td>

        <td style="padding: 16px 12px; vertical-align: top;">
          <div class="ai-recommendation-box">
            ${formatPointwiseRecommendation(recommendationText)}
          </div>
        </td>

        <td style="padding: 16px 12px; vertical-align: top; text-align: center;">
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: center; min-width: 110px;">
            ${isUnread ? `
              <button onclick="markEnquiryAsRead('${enq.id}', 'READ')" class="btn" style="font-size: 0.66rem; padding: 6px 8px; background: linear-gradient(135deg, #D9534F 0%, #B52B27 100%); color: #FFFFFF; border: none; border-radius: 4px; font-weight: 800; cursor: pointer; letter-spacing: 0.5px; box-shadow: 0 2px 6px rgba(217, 83, 79, 0.3); width: 100%;">
                MARK AS READ ✓
              </button>
            ` : `
              <span style="font-size: 0.64rem; font-weight: 700; color: #0A5C36; padding: 4px 6px; background: rgba(10,92,54,0.08); border: 1px solid rgba(10,92,54,0.2); border-radius: 4px; text-align: center; display: block; width: 100%;">
                ✓ READ / OPENED
              </span>
            `}
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 2px;">
              <!-- CALL ICON BUTTON -->
              <a href="tel:${enq.phone}" onclick="markEnquiryAsRead('${enq.id}', 'CONTACTED')" class="admin-icon-btn btn-call-icon" title="Call Client (${enq.phone})" aria-label="Call Client" style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #1E2719 0%, #0D2818 100%); border: 1.5px solid var(--gold-primary); color: #FFFDF8; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </a>

              <!-- WHATSAPP ICON BUTTON -->
              <a href="https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${waText}" onclick="markEnquiryAsRead('${enq.id}', 'CONTACTED')" target="_blank" rel="noopener" class="admin-icon-btn btn-wa-icon" title="Chat on WhatsApp (+91 ${cleanPhone})" aria-label="Chat on WhatsApp" style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border: 1.5px solid #25D366; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.35);">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 0C5.385 0 0 5.386 0 12.031c0 2.124.553 4.197 1.604 6.02L0 24l6.155-1.614A11.968 11.968 0 0 0 12.03 24c6.645 0 12.03-5.385 12.03-12.031C24.06 5.386 18.675 0 12.031 0zm.012 22.012c-1.808 0-3.585-.486-5.143-1.408l-.369-.219-3.817 1.001 1.019-3.721-.241-.383A9.99 9.99 0 0 1 2.012 12.03c0-5.524 4.496-10.02 10.031-10.02 5.524 0 10.02 4.496 10.02 10.02 0 5.536-4.496 10.012-10.02 10.012zm5.503-7.519c-.302-.152-1.785-.881-2.062-.981-.277-.101-.479-.152-.68.152-.202.302-.782.981-.959 1.183-.176.201-.353.226-.655.075-1.745-.875-2.894-1.559-4.04-3.535-.302-.52.302-.482.864-1.608.101-.201.05-.378-.025-.529-.075-.152-.68-1.636-.932-2.24-.244-.588-.493-.508-.68-.518-.176-.009-.378-.009-.58-.009-.201 0-.528.075-.804.378-.277.302-1.057 1.032-1.057 2.518 0 1.486 1.082 2.92 1.233 3.122.151.201 2.128 3.25 5.156 4.558 2.164.935 2.809.845 3.791.7.636-.094 1.785-.73 2.037-1.435.252-.705.252-1.309.176-1.435-.076-.125-.278-.201-.58-.352z"/></svg>
              </a>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (typeof renderCustomerDirectoryTable === 'function') {
    renderCustomerDirectoryTable();
  }
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

// --- FOOTER PRIVACY POLICY & TERMS MODAL HANDLER ---
function openLegalModal(type) {
  let modal = document.getElementById('legal-modal-overlay');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'legal-modal-overlay';
    modal.className = 'legal-modal-overlay';
    modal.innerHTML = `
      <div class="legal-modal-card">
        <div class="legal-modal-header">
          <div class="legal-modal-title-wrap">
            <svg class="legal-modal-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <h3 id="legal-modal-title" class="legal-modal-title">PRIVACY POLICY</h3>
          </div>
          <button type="button" class="legal-modal-close-x" onclick="closeLegalModal()" title="Close Modal" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div id="legal-modal-body" class="legal-modal-body"></div>
        <div class="legal-modal-footer">
          <button type="button" class="legal-modal-close-btn" onclick="closeLegalModal()">
            <span>READ & CLOSE</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLegalModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeLegalModal();
    });
  }

  const titleEl = document.getElementById('legal-modal-title');
  const bodyEl = document.getElementById('legal-modal-body');

  if (type === 'privacy') {
    titleEl.textContent = 'PRIVACY POLICY';
    bodyEl.innerHTML = `
      <h4>1. Information Collection</h4>
      <p>VELS — Sakthivel Groups collects personal information (such as name, phone number, email address, and site preferences) when you submit an enquiry, request plot layouts, or schedule a site visit.</p>

      <h4>2. Purpose & Use of Data</h4>
      <p>Your details are strictly used to share verified DTCP/RERA plot masterplans, process site visit requests, provide pricing updates, and assist with bank loan approvals for plots in Coimbatore & Pollachi.</p>

      <h4>3. Privacy Protection & Third Parties</h4>
      <p>We strictly respect your privacy. VELS never sells, rents, trades, or shares your personal contact information with unauthorized third parties or marketing agencies.</p>

      <h4>4. Direct Communication Consent</h4>
      <p>By submitting an enquiry form, you consent to receive direct communications, layout blueprints via WhatsApp, or phone calls from our authorized project engineers.</p>

      <h4>5. Contact Us</h4>
      <p>For any privacy queries, contact our main office at <strong>+91 98422 12345</strong> or visit Peelamedu (Coimbatore) / Mahalingapuram (Pollachi).</p>
    `;
  } else {
    titleEl.textContent = 'TERMS & CONDITIONS';
    bodyEl.innerHTML = `
      <h4>1. DTCP & RERA Approvals</h4>
      <p>All residential, commercial, and farm plot layouts developed by VELS — Sakthivel Groups comply with DTCP / RERA and government planning norms with 40ft & 30ft heavy tar roads.</p>

      <h4>2. Pricing & Availability</h4>
      <p>Plot prices, unit counts, and layout maps shown on this portal are subject to live availability and final booking agreements. Prices exclude statutory registration fees and taxes.</p>

      <h4>3. Complimentary Site Visits</h4>
      <p>Scheduled site visits are complimentary. Our field team provides guided on-site inspections, parent document audits, and Encumbrance Certificates (EC) upon request.</p>

      <h4>4. Intellectual Property Rights</h4>
      <p>All blueprints, site renderings, photos, video walkthroughs, and brand assets on this site are the exclusive property of VELS — Sakthivel Groups. Unauthorized reproduction is prohibited.</p>

      <h4>5. Governing Jurisdiction</h4>
      <p>All transaction enclaves and agreements are governed by the laws of Tamil Nadu, subject to exclusive court jurisdiction in Coimbatore & Pollachi.</p>
    `;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLegalModal() {
  const modal = document.getElementById('legal-modal-overlay');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   CUSTOMER REVIEWS & TESTIMONIALS SLIDER CONTROLLER
   ========================================================================== */
function initCustomerReviewsSlider() {
  const track = document.getElementById('reviews-slider-track');
  const prevBtn = document.getElementById('reviews-prev-btn');
  const nextBtn = document.getElementById('reviews-next-btn');
  const dotsContainer = document.getElementById('reviews-dots-container');
  const viewport = document.getElementById('reviews-slider-viewport');

  if (!track || !viewport) return;

  const cards = track.querySelectorAll('.review-card-item');
  const totalCards = cards.length;
  if (totalCards === 0) return;

  let currentIndex = 0;
  let autoSlideTimer = null;
  const slideInterval = 2200; // 2.2 seconds fast review carousel cycle

  function getCardsPerView() {
    return window.innerWidth <= 991 ? 1 : 2;
  }

  function getMaxIndex() {
    const perView = getCardsPerView();
    return Math.max(0, totalCards - perView);
  }

  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();

    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('div');
      dot.className = `review-dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlider();
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateSlider() {
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = maxIdx;
    if (currentIndex < 0) currentIndex = 0;

    const perView = getCardsPerView();
    const cardWidthPercent = 100 / perView;
    const translateVal = currentIndex * cardWidthPercent;

    track.style.transform = `translateX(-${translateVal}%)`;

    // Update active dot
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.review-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    // Disable/enable nav buttons visually if needed
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.6' : '1';
    if (nextBtn) nextBtn.style.opacity = currentIndex >= maxIdx ? '0.6' : '1';
  }

  function nextSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      currentIndex = 0; // loop back to start
    } else {
      currentIndex++;
    }
    updateSlider();
  }

  function prevSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex <= 0) {
      currentIndex = maxIdx; // loop to end
    } else {
      currentIndex--;
    }
    updateSlider();
  }

  function startTimer() {
    stopTimer();
    autoSlideTimer = setInterval(nextSlide, slideInterval);
  }

  function stopTimer() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  function resetTimer() {
    stopTimer();
    startTimer();
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetTimer();
    });
  }

  // Hover to pause auto slide
  viewport.addEventListener('mouseenter', stopTimer);
  viewport.addEventListener('mouseleave', startTimer);

  // Dynamic Window Resize Handler
  let resizeDebounce;
  window.addEventListener('resize', () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      createDots();
      updateSlider();
    }, 100);
  });

  // Mobile Touch Swipe gesture support
  let startX = 0;
  let isSwiping = false;

  viewport.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
    stopTimer();
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    isSwiping = false;
    startTimer();
  }, { passive: true });

  // Initialize slider state
  createDots();
  updateSlider();
  startTimer();
}

// --- TEXTURED 3D BACKGROUND ANIMATION ENGINE ---
function initTextured3DBackground() {
  if (!document.getElementById('sandal-gradient-bg')) {
    const sandalBg = document.createElement('div');
    sandalBg.id = 'sandal-gradient-bg';
    document.body.prepend(sandalBg);
  }

  if (document.getElementById('bg-3d-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'bg-3d-canvas';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  // Mouse & Scroll tracking with smooth LERP
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let scrollY = window.scrollY || 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY || 0;
  }, { passive: true });

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  // Create static texture noise canvas buffer for luxury tactile paper grain feel
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 256;
  noiseCanvas.height = 256;
  const nCtx = noiseCanvas.getContext('2d');
  if (nCtx) {
    const nData = nCtx.createImageData(256, 256);
    const buf = new Uint32Array(nData.data.buffer);
    for (let i = 0; i < buf.length; i++) {
      const val = Math.floor(Math.random() * 22);
      // Gold & Olive tinted noise grain (RGBA: Little endian)
      buf[i] = (val << 24) | ((val + 10) << 16) | ((val + 18) << 8) | (val + 5);
    }
    nCtx.putImageData(nData, 0, 0);
  }
  let noisePattern = null;
  try {
    noisePattern = ctx.createPattern(noiseCanvas, 'repeat');
  } catch (e) {}

  // 3D Grid Parameters
  const isMobile = width < 768;
  const cols = isMobile ? 22 : 36;
  const rows = isMobile ? 18 : 28;
  const spacing = isMobile ? 45 : 55;

  // 3D Floating Polyhedra (Architectural layout modules)
  const polyhedra = [];
  const polyCount = isMobile ? 4 : 8;
  for (let p = 0; p < polyCount; p++) {
    polyhedra.push({
      x: (Math.random() - 0.5) * width * 1.2,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 400 - 200,
      size: Math.random() * 28 + 22,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotSpeedX: (Math.random() - 0.5) * 0.012,
      rotSpeedY: (Math.random() - 0.5) * 0.012,
      type: p % 2 === 0 ? 'cube' : 'prism'
    });
  }

  let time = 0;

  function render() {
    time += 0.012;

    // Smooth LERP mouse position
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    // 1. Ambient luxury background gradient (Gold & Deep Olive glow)
    const bgGrad = ctx.createRadialGradient(
      width * 0.5 + mouseX * 80, height * 0.3 + mouseY * 80, 50,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.8
    );
    bgGrad.addColorStop(0, 'rgba(229, 210, 166, 0.18)'); // Light gold glow
    bgGrad.addColorStop(0.5, 'rgba(198, 161, 91, 0.08)'); // Gold primary
    bgGrad.addColorStop(1, 'rgba(57, 69, 47, 0.04)');    // Deep olive edge
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 3D Camera transformation parameters
    const perspective = 500;
    const camAngleX = 0.55 + mouseY * 0.15 + (scrollY * 0.0003);
    const camAngleY = mouseX * 0.2;
    const cosX = Math.cos(camAngleX), sinX = Math.sin(camAngleX);
    const cosY = Math.cos(camAngleY), sinY = Math.sin(camAngleY);

    const centerX = width / 2;
    const centerY = height * 0.55;

    // Calculate Projected 3D Grid Vertices
    const grid2D = [];
    const gridWidth = (cols - 1) * spacing;
    const gridHeight = (rows - 1) * spacing;

    for (let r = 0; r < rows; r++) {
      grid2D[r] = [];
      for (let c = 0; c < cols; c++) {
        // World coordinates centered around grid origin
        let wx = c * spacing - gridWidth / 2;
        let wy = r * spacing - gridHeight / 2;

        // Dynamic 3D elevation (wave math)
        const distFromCenter = Math.sqrt(wx * wx + wy * wy) * 0.005;
        let wz = Math.sin(wx * 0.012 + time + distFromCenter) * Math.cos(wy * 0.012 + time * 0.8) * 32
               + Math.sin(wx * 0.025 - time * 1.4) * 12;

        // Apply 3D Rotation around X and Y
        let rx = wx * cosY + wz * sinY;
        let ry1 = wy;
        let rz1 = -wx * sinY + wz * cosY;

        let ry = ry1 * cosX - rz1 * sinX;
        let rz = ry1 * sinX + rz1 * cosX + 350;

        // 3D Perspective Projection
        const scale = perspective / (perspective + rz);
        const sx = centerX + rx * scale;
        const sy = centerY + ry * scale;

        grid2D[r][c] = { sx, sy, scale, rz, wz };
      }
    }

    // Draw 3D Landscape Wireframe Mesh (Gold & Deep Olive)
    ctx.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pt = grid2D[r][c];

        // Draw horizontal line
        if (c < cols - 1) {
          const nextC = grid2D[r][c + 1];
          const alpha = Math.max(0, Math.min(0.35, (1 - pt.rz / 900) * 0.35));
          ctx.strokeStyle = pt.wz > 15 
            ? `rgba(198, 161, 91, ${alpha * 1.3})` // Gold on crests
            : `rgba(57, 69, 47, ${alpha})`;        // Deep olive in valleys
          
          ctx.beginPath();
          ctx.moveTo(pt.sx, pt.sy);
          ctx.lineTo(nextC.sx, nextC.sy);
          ctx.stroke();
        }

        // Draw vertical line
        if (r < rows - 1) {
          const nextR = grid2D[r + 1][c];
          const alpha = Math.max(0, Math.min(0.35, (1 - pt.rz / 900) * 0.35));
          ctx.strokeStyle = pt.wz > 15 
            ? `rgba(198, 161, 91, ${alpha * 1.3})` 
            : `rgba(57, 69, 47, ${alpha})`;

          ctx.beginPath();
          ctx.moveTo(pt.sx, pt.sy);
          ctx.lineTo(nextR.sx, nextR.sy);
          ctx.stroke();
        }

        // Draw glowing gold vertex dots on crests
        if (pt.wz > 18 && (r + c) % 2 === 0) {
          ctx.fillStyle = `rgba(198, 161, 91, ${Math.min(0.6, (pt.wz - 18) * 0.03)})`;
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, pt.scale * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Render Floating 3D Architectural Polyhedra
    polyhedra.forEach((poly) => {
      poly.rotX += poly.rotSpeedX;
      poly.rotY += poly.rotSpeedY;

      // Polyhedron vertices relative to center
      const s = poly.size;
      const vertices = poly.type === 'cube' ? [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s, s],  [s, -s, s],  [s, s, s],  [-s, s, s]
      ] : [
        [0, -s * 1.3, 0], [s, 0, -s], [s, 0, s], [-s, 0, s], [-s, 0, -s], [0, s * 1.3, 0]
      ];

      const edges = poly.type === 'cube' ? [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7]
      ] : [
        [0,1],[0,2],[0,3],[0,4],
        [1,2],[2,3],[3,4],[4,1],
        [5,1],[5,2],[5,3],[5,4]
      ];

      const pCosX = Math.cos(poly.rotX), pSinX = Math.sin(poly.rotX);
      const pCosY = Math.cos(poly.rotY), pSinY = Math.sin(poly.rotY);

      const projVerts = vertices.map(([vx, vy, vz]) => {
        // Rotate polyhedron local
        let rx = vx * pCosY + vz * pSinY;
        let ry = vy * pCosX - (-vx * pSinY + vz * pCosY) * pSinX;
        let rz = vy * pSinX + (-vx * pSinY + vz * pCosY) * pCosX;

        // Translate to world position
        let wx = poly.x + rx;
        let wy = poly.y + ry + Math.sin(time + poly.z) * 15;
        let wz = poly.z + rz + 400;

        // Apply camera rotation
        let crx = wx * cosY + wz * sinY;
        let cry = wy * cosX - (-wx * sinY + wz * cosY) * sinX;
        let crz = wy * sinX + (-wx * sinY + wz * cosY) * cosX;

        const scale = perspective / (perspective + crz);
        return {
          sx: centerX + crx * scale,
          sy: centerY + cry * scale,
          scale
        };
      });

      // Draw Polyhedron Wireframe Edges
      ctx.strokeStyle = 'rgba(198, 161, 91, 0.28)';
      ctx.lineWidth = 1.2;
      edges.forEach(([i, j]) => {
        const v1 = projVerts[i];
        const v2 = projVerts[j];
        if (v1 && v2) {
          ctx.beginPath();
          ctx.moveTo(v1.sx, v1.sy);
          ctx.lineTo(v2.sx, v2.sy);
          ctx.stroke();
        }
      });

      // Draw Polyhedron Gold Vertices
      projVerts.forEach((v) => {
        ctx.fillStyle = 'rgba(169, 130, 58, 0.5)';
        ctx.beginPath();
        ctx.arc(v.sx, v.sy, v.scale * 2, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // 4. Textured Grain & Paper Overlay Pass
    if (noisePattern) {
      ctx.fillStyle = noisePattern;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

// --- HERO STAT CARDS ANIMATED COUNTER ENGINE ---
function initHeroStatCounters() {
  const statCards = document.querySelectorAll('.hero-stats-banner .stat-card');
  if (!statCards.length) return;

  statCards.forEach((card, idx) => {
    const numEl = card.querySelector('.stat-number');
    if (!numEl) return;
    const targetText = numEl.textContent.trim();

    const match = targetText.match(/^(\d+)(\+?)$/);
    if (match) {
      const targetVal = parseInt(match[1], 10);
      const suffix = match[2] || '';
      numEl.textContent = `0${suffix}`;

      setTimeout(() => {
        const duration = 1400;
        const startTime = performance.now();

        function updateCounter(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - (1 - progress) * (1 - progress);
          const currentVal = Math.floor(easeProgress * targetVal);
          numEl.textContent = `${currentVal}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            numEl.textContent = targetText;
          }
        }
        requestAnimationFrame(updateCounter);
      }, idx * 150 + 200);
    }
  });
}

// --- CENTRALIZED CUSTOMER DIRECTORY & 3-STAGE TRACKER ENGINE ---
let activeCustomerFilter = 'ALL';
let customerSearchQuery = '';

// --- ADMIN TAB SWITCHER LOGIC ---
function switchAdminTab(tabId) {
  const buttons = document.querySelectorAll('.admin-nav-tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');

  const panels = document.querySelectorAll('.admin-panel-content');
  panels.forEach(panel => {
    panel.classList.remove('active');
    panel.style.display = 'none';
  });

  const activePanel = document.getElementById(`panel-${tabId}`);
  if (activePanel) {
    activePanel.classList.add('active');
    activePanel.style.display = 'block';
  }

  try {
    localStorage.setItem('vels_admin_active_tab', tabId);
  } catch (e) {}
}

function initAdminTabs() {
  const savedTab = localStorage.getItem('vels_admin_active_tab') || 'ai-leads';
  switchAdminTab(savedTab);
}

function scrollToDirectCustomerTable() {
  switchAdminTab('customer-tracker');
  const target = document.getElementById('panel-customer-tracker') || document.getElementById('direct-customer-registry-section');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function getManualCustomers() {
  try {
    const saved = localStorage.getItem('vels_manual_customers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function saveManualCustomers(list) {
  try {
    localStorage.setItem('vels_manual_customers', JSON.stringify(list));
  } catch (e) {}
}

function toggleAddCustomerModal(editId = null) {
  const modal = document.getElementById('add-customer-modal');
  if (!modal) return;

  if (modal.style.display === 'none' || !modal.style.display) {
    const staffSelect = document.getElementById('cust-staff');
    const roster = getStaffRoster();
    if (staffSelect) {
      staffSelect.innerHTML = `<option value="Unassigned">-- Select Staff --</option>` + 
        roster.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    const titleEl = document.getElementById('modal-customer-title');
    const editIdInput = document.getElementById('cust-edit-id');
    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const emailInput = document.getElementById('cust-email');
    const reqInput = document.getElementById('cust-requirement');
    const stageInput = document.getElementById('cust-stage');
    const notesInput = document.getElementById('cust-notes');

    if (editId) {
      const manualList = getManualCustomers();
      const rec = manualList.find(c => c.id === editId);
      if (rec) {
        if (titleEl) titleEl.textContent = 'Edit Customer Record';
        if (editIdInput) editIdInput.value = rec.id;
        if (nameInput) nameInput.value = rec.name || '';
        if (phoneInput) phoneInput.value = rec.phone || '';
        if (emailInput) emailInput.value = rec.email || '';
        if (reqInput) reqInput.value = rec.requirement || '';
        if (staffSelect) staffSelect.value = rec.assignedStaff || 'Unassigned';
        if (stageInput) stageInput.value = rec.stage || 'INQUIRY';
        if (notesInput) notesInput.value = rec.notes || '';
      }
    } else {
      if (titleEl) titleEl.textContent = 'Add Walk-in / Direct Call Customer';
      if (editIdInput) editIdInput.value = '';
      const form = document.getElementById('add-customer-form');
      if (form) form.reset();
    }

    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
  }
}

function saveCustomerRecord(event) {
  if (event) event.preventDefault();

  const editId = document.getElementById('cust-edit-id')?.value;
  const name = document.getElementById('cust-name')?.value?.trim();
  const phone = document.getElementById('cust-phone')?.value?.trim();
  const email = document.getElementById('cust-email')?.value?.trim() || 'N/A';
  const requirement = document.getElementById('cust-requirement')?.value?.trim() || 'General Layout Enquiry';
  const assignedStaff = document.getElementById('cust-staff')?.value || 'Unassigned';
  const stage = document.getElementById('cust-stage')?.value || 'INQUIRY';
  const notes = document.getElementById('cust-notes')?.value?.trim() || '';

  if (!name || !phone) {
    alert('Customer name and phone number are required.');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const manualList = getManualCustomers();

  if (editId) {
    const idx = manualList.findIndex(c => c.id === editId);
    if (idx !== -1) {
      manualList[idx] = {
        ...manualList[idx],
        name,
        phone,
        email,
        requirement,
        assignedStaff,
        stage,
        notes,
        updatedAt: dateStr
      };
    }
  } else {
    const newRecord = {
      id: `CUST-MAN-${Math.floor(10000 + Math.random() * 90000)}`,
      name,
      phone,
      email,
      requirement,
      assignedStaff,
      stage,
      notes,
      source: 'MANUAL WALK-IN',
      date: dateStr
    };
    manualList.unshift(newRecord);
  }

  saveManualCustomers(manualList);
  toggleAddCustomerModal();
  renderCustomerDirectoryTable();
  alert(editId ? 'Customer record updated successfully!' : 'New walk-in customer added to directory!');
}

function deleteCustomerRecord(id) {
  if (!confirm('Are you sure you want to delete this customer record?')) return;
  let manualList = getManualCustomers();
  manualList = manualList.filter(c => c.id !== id);
  saveManualCustomers(manualList);
  renderCustomerDirectoryTable();
}

function updateCustomerStageDirect(id, stage) {
  const cleanId = (id || '').toString().trim();
  
  const manualList = getManualCustomers();
  const manualRecord = manualList.find(c => c.id === cleanId);
  if (manualRecord) {
    manualRecord.stage = stage;
    saveManualCustomers(manualList);
  } else {
    try {
      const stageMap = JSON.parse(localStorage.getItem('vels_customer_stages_map') || '{}');
      stageMap[cleanId] = stage;
      localStorage.setItem('vels_customer_stages_map', JSON.stringify(stageMap));
    } catch (e) {}

    try {
      const enqs = getStoredEnquiries();
      enqs.forEach(e => {
        if (e.id === cleanId) e.stage = stage;
      });
      localStorage.setItem('vels_enquiries', JSON.stringify(enqs));
    } catch (e) {}
  }

  renderCustomerDirectoryTable();
}

function updateCustomerStaffDirect(id, staff) {
  const cleanId = (id || '').toString().trim();

  const manualList = getManualCustomers();
  const manualRecord = manualList.find(c => c.id === cleanId);
  if (manualRecord) {
    manualRecord.assignedStaff = staff;
    saveManualCustomers(manualList);
  } else {
    updateEnquiryStaff(cleanId, staff);
  }

  renderCustomerDirectoryTable();
}

function filterCustomerRegistryTable(filterKey) {
  activeCustomerFilter = filterKey;
  
  const buttons = document.querySelectorAll('[data-cust-filter]');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-cust-filter') === filterKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderCustomerDirectoryTable();
}

function handleCustomerRegistrySearch(query) {
  customerSearchQuery = (query || '').trim().toLowerCase();
  renderCustomerDirectoryTable();
}

function renderCustomerDirectoryTable() {
  const tbody = document.getElementById('admin-customer-registry-tbody');
  if (!tbody) return;

  const currentStaffRoster = getStaffRoster();
  const stageMap = JSON.parse(localStorage.getItem('vels_customer_stages_map') || '{}');

  const manualRecords = getManualCustomers();

  const webEnquiries = getStoredEnquiries().map(e => {
    const eId = (e.id || '').toString().trim();
    let assignedStage = stageMap[eId] || e.stage || 'INQUIRY';
    if (assignedStage === 'STAGE_1') assignedStage = 'INQUIRY';
    if (assignedStage === 'STAGE_2') assignedStage = 'TOKEN_PAID';
    if (assignedStage === 'STAGE_3') assignedStage = 'BOUGHT';

    return {
      id: e.id,
      name: e.name || e.customerName || 'Anonymous',
      phone: e.phone || 'N/A',
      email: e.email || 'N/A',
      requirement: `${e.plot || e.plotNumber || 'General Layout'} (${e.location || e.project || ''})`,
      assignedStaff: e.assignedStaff || 'Unassigned',
      stage: assignedStage,
      notes: e.message || 'Web Enquiry',
      source: 'WEB ENQUIRY',
      date: e.date || 'Recent'
    };
  });

  const unified = [...manualRecords, ...webEnquiries].map(c => {
    let st = c.stage || 'INQUIRY';
    if (st === 'STAGE_1') st = 'INQUIRY';
    if (st === 'STAGE_2') st = 'TOKEN_PAID';
    if (st === 'STAGE_3') st = 'BOUGHT';
    return { ...c, stage: st };
  });

  let countAll = unified.length;
  let countInquiry = 0;
  let countToken = 0;
  let countBought = 0;
  let countRejected = 0;

  unified.forEach(c => {
    if (c.stage === 'TOKEN_PAID') countToken++;
    else if (c.stage === 'BOUGHT') countBought++;
    else if (c.stage === 'REJECTED') countRejected++;
    else countInquiry++;
  });

  const cAllEl = document.getElementById('cust-count-all');
  const cInqEl = document.getElementById('cust-count-inquiry');
  const cTokEl = document.getElementById('cust-count-token');
  const cBouEl = document.getElementById('cust-count-bought');
  const cRejEl = document.getElementById('cust-count-rejected');

  if (cAllEl) cAllEl.textContent = `(${countAll})`;
  if (cInqEl) cInqEl.textContent = `(${countInquiry})`;
  if (cTokEl) cTokEl.textContent = `(${countToken})`;
  if (cBouEl) cBouEl.textContent = `(${countBought})`;
  if (cRejEl) cRejEl.textContent = `(${countRejected})`;

  let filtered = unified;
  if (activeCustomerFilter !== 'ALL') {
    filtered = filtered.filter(c => c.stage === activeCustomerFilter);
  }

  if (customerSearchQuery) {
    filtered = filtered.filter(c => 
      (c.name || '').toLowerCase().includes(customerSearchQuery) ||
      (c.phone || '').toLowerCase().includes(customerSearchQuery) ||
      (c.requirement || '').toLowerCase().includes(customerSearchQuery) ||
      (c.notes || '').toLowerCase().includes(customerSearchQuery)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-secondary); font-weight: 600;">No customer records found matching current criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(cust => {
    const isManual = cust.source === 'MANUAL WALK-IN';
    const cleanPhone = (cust.phone || '').replace(/[^0-9]/g, '');

    let stageBadgeStyle = 'background: rgba(43, 67, 96, 0.12); color: #2B4360; border: 1px solid #2B4360;';
    let stageLabel = 'INQUIRY';
    
    if (cust.stage === 'TOKEN_PAID') {
      stageBadgeStyle = 'background: rgba(198, 161, 91, 0.18); color: #8C6B28; border: 1px solid #C6A15B;';
      stageLabel = 'TOKEN PAID';
    } else if (cust.stage === 'BOUGHT') {
      stageBadgeStyle = 'background: rgba(40, 167, 69, 0.18); color: #1e7e34; border: 1px solid #28a745;';
      stageLabel = 'BOUGHT';
    } else if (cust.stage === 'REJECTED') {
      stageBadgeStyle = 'background: rgba(217, 83, 79, 0.15); color: #d9534f; border: 1px solid #d9534f;';
      stageLabel = 'REJECTED';
    }

    return `
      <tr style="border-bottom: 1px solid rgba(198, 161, 91, 0.2); transition: background 0.2s ease;">
        <td style="padding: 14px 12px; vertical-align: top;">
          <div style="font-size: 0.82rem; font-weight: 800; color: #1E2719; margin-bottom: 4px;">${cust.date}</div>
          <span style="font-size: 0.7rem; font-weight: 700; font-family: var(--font-mono); padding: 2px 7px; background: rgba(198, 161, 91, 0.15); border: 1px solid var(--gold-border); color: #8C6B28; border-radius: 4px; display: inline-block;">${cust.id}</span>
        </td>

        <td style="padding: 14px 12px; vertical-align: top;">
          <div style="font-weight: 800; color: #0D2818; font-size: 0.95rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>${cust.name}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem;">
            <div style="color: #0A5C36; font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href="tel:${cust.phone}" style="color: #0A5C36; text-decoration: none;">${cust.phone}</a>
            </div>
            ${cust.email && cust.email !== 'N/A' ? `
              <div style="color: #4A5568; font-weight: 500; font-size: 0.78rem; display: flex; align-items: center; gap: 6px; word-break: break-all;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>${cust.email}</span>
              </div>
            ` : ''}
          </div>
        </td>

        <td style="padding: 14px 12px; vertical-align: top;">
          <div style="font-weight: 700; color: #1E2719; font-size: 0.86rem; margin-bottom: 6px; display: inline-block; padding: 4px 10px; background: rgba(198, 161, 91, 0.15); border: 1px solid #C6A15B; border-radius: 4px;">
            ${cust.requirement}
          </div>
          ${cust.notes ? `<div style="font-size: 0.78rem; color: #4A5568; line-height: 1.45; font-style: italic; background: rgba(0,0,0,0.03); padding: 6px 10px; border-radius: 4px; border-left: 3px solid var(--gold-primary); margin-top: 4px;">"${cust.notes}"</div>` : ''}
        </td>

        <td style="padding: 14px 12px; vertical-align: top;">
          <select onchange="updateCustomerStaffDirect('${cust.id}', this.value)" style="padding: 6px 10px; border-radius: 4px; border: 1.5px solid var(--gold-border); font-size: 0.8rem; font-weight: 700; background: var(--bg-cream); color: var(--olive-deep); width: 100%; cursor: pointer;">
            <option value="Unassigned" ${!cust.assignedStaff || cust.assignedStaff === 'Unassigned' ? 'selected' : ''}>-- Select Staff --</option>
            ${currentStaffRoster.map(s => `<option value="${s}" ${cust.assignedStaff === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          ${cust.assignedStaff && cust.assignedStaff !== 'Unassigned' 
            ? `<div style="font-size: 0.72rem; font-weight: 700; color: #0A5C36; margin-top: 4px; display: flex; align-items: center; gap: 4px;">✓ ${cust.assignedStaff.split(' ')[0]}</div>`
            : `<div style="font-size: 0.72rem; font-weight: 600; color: #A8664B; margin-top: 4px;">Pending Staff</div>`
          }
        </td>

        <td style="padding: 14px 12px; vertical-align: top;">
          <select onchange="updateCustomerStageDirect('${cust.id}', this.value)" style="padding: 6px 10px; border-radius: 4px; border: 1.5px solid var(--gold-border); font-size: 0.8rem; font-weight: 800; background: var(--bg-cream); color: var(--olive-deep); width: 100%; margin-bottom: 6px; cursor: pointer;">
            <option value="INQUIRY" ${cust.stage === 'INQUIRY' || !cust.stage ? 'selected' : ''}>INQUIRY</option>
            <option value="TOKEN_PAID" ${cust.stage === 'TOKEN_PAID' ? 'selected' : ''}>TOKEN PAID</option>
            <option value="BOUGHT" ${cust.stage === 'BOUGHT' ? 'selected' : ''}>BOUGHT</option>
            <option value="REJECTED" ${cust.stage === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
          </select>
          <span style="${stageBadgeStyle} font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; display: inline-block; width: 100%; text-align: center; box-sizing: border-box;">
            ${stageLabel}
          </span>
        </td>

        <td style="padding: 14px 8px; vertical-align: top; text-align: center;">
          <span style="font-size: 0.68rem; font-weight: 800; padding: 4px 8px; border-radius: 12px; ${isManual ? 'background: rgba(198, 161, 91, 0.2); color: #8C6B28; border: 1px solid #C6A15B;' : 'background: rgba(43, 67, 96, 0.12); color: #2B4360; border: 1px solid #2B4360;'} display: inline-block;">
            ${cust.source}
          </span>
        </td>

        <td style="padding: 14px 8px; vertical-align: top; text-align: center;">
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
              <!-- CALL ICON BUTTON -->
              <a href="tel:${cust.phone}" class="admin-icon-btn btn-call-icon" title="Call ${cust.name} (${cust.phone})" aria-label="Call Customer" style="width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #1E2719 0%, #0D2818 100%); border: 1.5px solid var(--gold-primary); color: #FFFDF8; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </a>

              <!-- WHATSAPP ICON BUTTON -->
              <a href="https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}" target="_blank" rel="noopener" class="admin-icon-btn btn-wa-icon" title="Chat on WhatsApp (+91 ${cleanPhone})" aria-label="Chat on WhatsApp" style="width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border: 1.5px solid #25D366; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.35);">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 0C5.385 0 0 5.386 0 12.031c0 2.124.553 4.197 1.604 6.02L0 24l6.155-1.614A11.968 11.968 0 0 0 12.03 24c6.645 0 12.03-5.385 12.03-12.031C24.06 5.386 18.675 0 12.031 0zm.012 22.012c-1.808 0-3.585-.486-5.143-1.408l-.369-.219-3.817 1.001 1.019-3.721-.241-.383A9.99 9.99 0 0 1 2.012 12.03c0-5.524 4.496-10.02 10.031-10.02 5.524 0 10.02 4.496 10.02 10.02 0 5.536-4.496 10.012-10.02 10.012zm5.503-7.519c-.302-.152-1.785-.881-2.062-.981-.277-.101-.479-.152-.68.152-.202.302-.782.981-.959 1.183-.176.201-.353.226-.655.075-1.745-.875-2.894-1.559-4.04-3.535-.302-.52.302-.482.864-1.608.101-.201.05-.378-.025-.529-.075-.152-.68-1.636-.932-2.24-.244-.588-.493-.508-.68-.518-.176-.009-.378-.009-.58-.009-.201 0-.528.075-.804.378-.277.302-1.057 1.032-1.057 2.518 0 1.486 1.082 2.92 1.233 3.122.151.201 2.128 3.25 5.156 4.558 2.164.935 2.809.845 3.791.7.636-.094 1.785-.73 2.037-1.435.252-.705.252-1.309.176-1.435-.076-.125-.278-.201-.58-.352z"/></svg>
              </a>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* ==========================================================================
   3D FLAT-FACING ORBIT CAROUSEL ENGINE (UPCOMING PROJECTS SECTION)
   Cards ALWAYS face flat towards screen - 100% Legible Text & Image Showcase
   ========================================================================== */
let upcoming3DActiveIdx = 0;
let upcoming3DTimer = null;

function update3DFlatCarousel() {
  const cards = document.querySelectorAll('.upcoming-3d-inner .project-card-3d');
  if (!cards.length) return;

  const totalCards = cards.length;
  const isMobile = window.innerWidth <= 576;
  const isTablet = window.innerWidth <= 992 && window.innerWidth > 576;

  const radiusX = isMobile ? 120 : (isTablet ? 190 : 310);
  const radiusZ = isMobile ? 70 : (isTablet ? 110 : 160);

  cards.forEach((card) => {
    const cardIdx = parseInt(card.getAttribute('data-index') || '0', 10);
    let diff = (cardIdx - upcoming3DActiveIdx) % totalCards;
    if (diff < 0) diff += totalCards;

    const angle = (diff * (360 / totalCards)) * (Math.PI / 180);
    const x = Math.sin(angle) * radiusX;
    const z = Math.cos(angle) * radiusZ;

    // Calculate normalized depth from 0 (back) to 1 (front)
    const normalizedZ = (z + radiusZ) / (2 * radiusZ);

    // Hide cards in the back half of orbit to eliminate ghosting
    if (normalizedZ < 0.40) {
      card.style.opacity = '0';
      card.style.visibility = 'hidden';
      card.style.pointerEvents = 'none';
      card.classList.remove('active-front-card');
    } else {
      const scale = 0.84 + ((normalizedZ - 0.40) * 0.26); // 0.84 to 1.00 (compact crisp scale)
      const zIndex = Math.round(normalizedZ * 100);

      // translateX positioning preserves 100% pixel-sharp images & crisp text without GPU blur
      card.style.transform = `translateX(${x.toFixed(1)}px) scale(${scale.toFixed(2)})`;
      card.style.opacity = '1';
      card.style.zIndex = zIndex;
      card.style.visibility = 'visible';
      card.style.pointerEvents = 'auto';

      if (diff === 0) {
        card.classList.add('active-front-card');
      } else {
        card.classList.remove('active-front-card');
      }
    }
  });
}

// --- UPCOMING PROJECTS INTERACTIVE DETAIL MODAL ENGINE ---
const upcomingProjectsData = [
  {
    title: "VELS Green Valley",
    city: "Pollachi",
    tag: "Farm Plots",
    badge: "Ready to Launch",
    area: "5.9 Acres",
    road: "40 ft Wide Tar Roads",
    image: "Images/Upcoming_Green_Valley.jpg",
    desc: "101 premium gated agro-residency units with drip irrigation, solar avenue lights, and organic plantation layouts near Pollachi Highway.",
    approval: "DTCP & RERA Approved Layout",
    location: "Pollachi Highway Corridor",
    features: [
      "101 Exclusive Farm Plot Units",
      "Individual Drip Irrigation Connections",
      "Solar Powered Street Lighting",
      "40 ft Wide Internal Tar Roads",
      "24/7 Gated Security & Perimeter Wall",
      "Abundant Water Source & Storage Tank"
    ]
  },
  {
    title: "VELS Heritage Hills",
    city: "Coimbatore",
    tag: "Residential",
    badge: "Ready to Launch",
    area: "8.3 Acres",
    road: "60 ft Entry Boulevard",
    image: "Images/Upcoming_Heritage_Hills.jpg",
    desc: "High-growth residential pocket near IT corridor with DTCP approval, underground electrical utilities, and wide boulevard entry.",
    approval: "DTCP & RERA Approved",
    location: "Saravanampatti-IT Corridor Link",
    features: [
      "Underground Electrical & Drainage Cables",
      "60 ft Wide Grand Entrance Avenue",
      "Landscaped Children's Play Park",
      "DTCP Approved & Clear Title",
      "Immediate House Construction Ready",
      "High Appreciation Capital Growth Zone"
    ]
  },
  {
    title: "VELS Emerald Palms",
    city: "Kinathukadavu",
    tag: "Eco Vistas",
    badge: "Phase 1 Booking",
    area: "12.5 Acres",
    road: "33 ft Blacktop Roads",
    image: "Images/Upcoming_Emerald_Palms.jpg",
    desc: "Scenic eco-friendly plantation community surrounded by coconut groves with panoramic Western Ghats mountain views.",
    approval: "DTCP Layout Approval in Progress",
    location: "Kinathukadavu Green Belt",
    features: [
      "Panoramic Western Ghats Mountain Views",
      "Gated Perimeter Security Fence",
      "Blacktop Internal Tar Roads",
      "Avenue Tree Plantation throughout",
      "24/7 Overhead Water Tank Supply",
      "Ideal for Weekend Villa Homesteads"
    ]
  },
  {
    title: "VELS Royal Enclave",
    city: "Kovaipudur",
    tag: "Villa Township",
    badge: "Pre-Launch",
    area: "15.0 Acres",
    road: "50 ft Main Road",
    image: "Images/Upcoming_Royal_Enclave.jpg",
    desc: "Exclusive hillside villa plot layout offering cool year-round climate, panoramic valley views, and private community clubhouse.",
    approval: "DTCP & RERA Registered",
    location: "Kovaipudur Hillside Enclave",
    features: [
      "Pleasant Year-Round Cool Hill Climate",
      "Private Gated Clubhouse & Community Park",
      "50 ft Main Entrance Road with LED Lights",
      "Storm Water Drainage Infrastructure",
      "High-Security Gated Arch Entrance",
      "Custom Architecture Villa Construction Support"
    ]
  },
  {
    title: "VELS Sunrise Avenue",
    city: "Saravanampatti",
    tag: "Gated Layout",
    badge: "Upcoming",
    area: "6.8 Acres",
    road: "40 ft Internal Roads",
    image: "Images/Upcoming_Green_Valley.jpg",
    desc: "Prime investment plots adjacent to Saravanampatti IT Park SEZ with compound wall, avenue trees, and underground drainage.",
    approval: "DTCP Approved Layout",
    location: "Saravanampatti IT SEZ Hub",
    features: [
      "2 Minutes from IT SEZ Parks & Tech Companies",
      "40 ft Blacktop Tar Roads",
      "Gated Compound Wall",
      "LED Streetlights & Underground Drainage",
      "Walkable Distance to Top Schools & Hospitals",
      "High Rental & Commercial Resale Demand"
    ]
  },
  {
    title: "VELS Signature Villas",
    city: "Kovaipudur",
    tag: "Luxury Villas",
    badge: "VIP Allocation",
    area: "10.2 Acres",
    road: "50 ft Boulevard",
    image: "Images/Upcoming_Heritage_Hills.jpg",
    desc: "Ultra-luxury contemporary villas with private courtyard gardens, smart home automation, and 24/7 security patrol.",
    approval: "DTCP Approved Luxury Villa Project",
    location: "Kovaipudur Prime Boulevard",
    features: [
      "Smart Home Automation Systems Options",
      "Private Landscaped Courtyard Gardens",
      "50 ft Wide Tree-Lined Boulevard",
      "Underground Electrical & Fiber Optics",
      "24/7 Security Patrol & CCTV Surveillance",
      "Turnkey Custom Villa Design & Build Services"
    ]
  }
];

let selectedUpcomingIndex = 0;

function openUpcomingProjectModal(index) {
  const proj = upcomingProjectsData[index];
  if (!proj) return;
  selectedUpcomingIndex = index;

  const modal = document.getElementById('upcoming-project-modal');
  if (!modal) return;

  const imgEl = document.getElementById('upcoming-modal-img');
  if (imgEl) {
    imgEl.src = proj.image;
    imgEl.alt = proj.title;
  }
  
  const badgeEl = document.getElementById('upcoming-modal-badge');
  if (badgeEl) badgeEl.textContent = proj.badge;

  const cityEl = document.getElementById('upcoming-modal-city');
  if (cityEl) cityEl.textContent = proj.city.toUpperCase();

  const tagEl = document.getElementById('upcoming-modal-tag');
  if (tagEl) tagEl.textContent = proj.tag.toUpperCase();

  const titleEl = document.getElementById('upcoming-modal-title');
  if (titleEl) titleEl.textContent = proj.title;

  const descEl = document.getElementById('upcoming-modal-desc');
  if (descEl) descEl.textContent = proj.desc;

  const areaEl = document.getElementById('upcoming-modal-area');
  if (areaEl) areaEl.textContent = proj.area;

  const roadEl = document.getElementById('upcoming-modal-road');
  if (roadEl) roadEl.textContent = proj.road;

  const appEl = document.getElementById('upcoming-modal-approval');
  if (appEl) appEl.textContent = proj.approval;

  const locEl = document.getElementById('upcoming-modal-location');
  if (locEl) locEl.textContent = proj.location;

  const listEl = document.getElementById('upcoming-modal-features');
  if (listEl) {
    listEl.innerHTML = proj.features.map(f => `<li>${f}</li>`).join('');
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeUpcomingProjectModal() {
  const modal = document.getElementById('upcoming-project-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function closeUpcomingProjectModalOnBg(event) {
  if (event.target && event.target.id === 'upcoming-project-modal') {
    closeUpcomingProjectModal();
  }
}

function enquireUpcomingProject() {
  const proj = upcomingProjectsData[selectedUpcomingIndex];
  closeUpcomingProjectModal();
  if (proj) {
    const text = encodeURIComponent(`Hello VELS Sakthivel Groups, I want to enquire about ${proj.title} (${proj.city} - ${proj.tag}). Please share details.`);
    window.open(`https://wa.me/919842212345?text=${text}`, '_blank');
  }
}

function select3DProjectCard(index) {
  upcoming3DActiveIdx = index;
  update3DFlatCarousel();

  if (upcoming3DTimer) clearInterval(upcoming3DTimer);
  upcoming3DTimer = setInterval(() => {
    upcoming3DActiveIdx = (upcoming3DActiveIdx + 1) % 6;
    update3DFlatCarousel();
  }, 4000);
}

function handle3DCardClick(index) {
  select3DProjectCard(index);
  openUpcomingProjectModal(index);
}

let touchStartX = 0;
let touchEndX = 0;

function init3DFlatCarousel() {
  update3DFlatCarousel();
  if (upcoming3DTimer) clearInterval(upcoming3DTimer);
  upcoming3DTimer = setInterval(() => {
    upcoming3DActiveIdx = (upcoming3DActiveIdx + 1) % 6;
    update3DFlatCarousel();
  }, 4000);

  const wrapper = document.querySelector('.upcoming-3d-wrapper');
  if (wrapper && !wrapper.dataset.swipeBound) {
    wrapper.dataset.swipeBound = 'true';
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 35;
      if (touchEndX < touchStartX - swipeThreshold) {
        select3DProjectCard((upcoming3DActiveIdx + 1) % 6);
      } else if (touchEndX > touchStartX + swipeThreshold) {
        select3DProjectCard((upcoming3DActiveIdx + 5) % 6);
      }
    }, { passive: true });
  }

  window.removeEventListener('resize', update3DFlatCarousel);
  window.addEventListener('resize', update3DFlatCarousel);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init3DFlatCarousel);
} else {
  init3DFlatCarousel();
}




