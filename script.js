async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

/* ---------- Toast ---------- */

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('show');
  // force reflow so the animation restarts on rapid repeat clicks
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- Theme toggle ---------- */

function initTheme() {
  const stored = localStorage.getItem('dthq-theme');
  if (stored) document.documentElement.setAttribute('data-theme', stored);

  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function currentTheme() {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  toggle.setAttribute('aria-pressed', currentTheme() === 'dark');

  toggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dthq-theme', next);
    toggle.setAttribute('aria-pressed', next === 'dark');
  });
}

/* ---------- Animated counters ---------- */

function animateCount(el, target, duration = 900) {
  if (!el) return;
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- Copy-link icon (SVG strings) ---------- */

const COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>';

function toolCard(tool, index) {
  const card = document.createElement('div');
  card.className = 'tool-card';
  card.style.setProperty('--stagger', Math.min(index, 24));
  card.dataset.category = tool.category;
  card.dataset.search = (tool.name + ' ' + tool.description + ' ' + tool.category).toLowerCase();

  card.innerHTML = `
    <div class="tool-card-top">
      <div class="tool-icon">${tool.icon || tool.category.slice(0, 3).toUpperCase()}</div>
      <button type="button" class="copy-btn" title="Copy link" aria-label="Copy link to ${tool.name}">${COPY_ICON}</button>
    </div>
    <h3>${tool.name}</h3>
    <p>${tool.description}</p>
    <a class="tool-cta" href="${tool.url}" target="_blank" rel="noopener noreferrer">
      Open tool
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M7 7h10v10"/></svg>
    </a>
  `;

  const copyBtn = card.querySelector('.copy-btn');
  copyBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(tool.url);
      copyBtn.innerHTML = CHECK_ICON;
      copyBtn.classList.add('copied');
      showToast(`Copied ${tool.name} link`);
      setTimeout(() => {
        copyBtn.innerHTML = COPY_ICON;
        copyBtn.classList.remove('copied');
      }, 1400);
    } catch {
      showToast('Could not copy — copy the link manually');
    }
  });

  return card;
}

function renderCategoryCards(tools) {
  const grid = document.getElementById('category-grid');
  if (!grid) return;
  const counts = {};
  tools.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });

  grid.innerHTML = '';
  Object.entries(counts).forEach(([cat, count], i) => {
    const btn = document.createElement('button');
    btn.className = 'category-card';
    btn.style.setProperty('--stagger', i);
    btn.innerHTML = `<span class="cat-name">${cat}</span><span class="cat-count">${count} tools</span>`;
    btn.addEventListener('click', () => {
      document.getElementById('tools').scrollIntoView({ behavior: 'smooth', block: 'start' });
      selectFilterByLabel(cat);
    });
    grid.appendChild(btn);
  });
}

let filterBarEl;

function renderFilters(categories, onSelect) {
  filterBarEl = document.getElementById('filters');
  filterBarEl.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'filter-btn active';
  all.textContent = 'All tools';
  all.addEventListener('click', () => selectFilter(all));
  filterBarEl.appendChild(all);

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat;
    btn.addEventListener('click', () => selectFilter(btn));
    filterBarEl.appendChild(btn);
  });

  function selectFilter(activeBtn) {
    [...filterBarEl.children].forEach((b) => b.classList.remove('active'));
    activeBtn.classList.add('active');
    onSelect(activeBtn.textContent === 'All tools' ? null : activeBtn.textContent);
  }
}

function selectFilterByLabel(label) {
  if (!filterBarEl) return;
  const btn = [...filterBarEl.children].find((b) => b.textContent === label);
  if (btn) btn.click();
}

function applyConfig(config) {
  document.querySelectorAll('[data-site-name]').forEach((el) => (el.textContent = config.siteName));
  document.querySelectorAll('[data-tagline]').forEach((el) => (el.textContent = config.tagline));
  document.querySelectorAll('[data-hero-desc]').forEach((el) => (el.textContent = config.heroDescription));
  document.querySelectorAll('[data-founder-note]').forEach((el) => (el.textContent = config.founderNote));
  document.querySelectorAll('[data-footer-note]').forEach((el) => (el.textContent = config.footerNote));
  document.querySelectorAll('[data-contact-email]').forEach((el) => {
    el.textContent = config.contactEmail;
    el.href = `mailto:${config.contactEmail}`;
  });
  document.querySelectorAll('[data-github-url]').forEach((el) => (el.href = config.githubUrl));
  document.title = `${config.siteName} \u2014 ${config.tagline}`;
}

/* ---------- Back to top ---------- */

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 480);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

async function init() {
  initTheme();
  initBackToTop();

  const gridEl = document.getElementById('tool-grid');
  if (!gridEl) return; // page without a tool grid (about/contact/privacy/terms)

  try {
    const [config, tools] = await Promise.all([
      loadJSON('config.json'),
      loadJSON('tools.json'),
    ]);
    applyConfig(config);

    const liveCount = tools.length;
    const categories = [...new Set(tools.map((t) => t.category))];

    const statTool = document.getElementById('stat-tool-count');
    const statCat = document.getElementById('stat-cat-count');
    if (statTool) animateCount(statTool, liveCount);
    if (statCat) animateCount(statCat, categories.length);

    gridEl.innerHTML = '';
    tools.forEach((tool, i) => gridEl.appendChild(toolCard(tool, i)));

    renderCategoryCards(tools);

    const emptyState = document.getElementById('empty-state');
    const resultCount = document.getElementById('result-count');
    let activeCategory = null;
    let activeQuery = '';

    function applyFilters() {
      let visible = 0;
      [...gridEl.children].forEach((card) => {
        const matchesCategory = !activeCategory || card.dataset.category === activeCategory;
        const matchesQuery = !activeQuery || card.dataset.search.includes(activeQuery);
        const match = matchesCategory && matchesQuery;
        card.classList.toggle('is-hidden', !match);
        if (match) visible += 1;
      });
      if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
      if (resultCount) {
        resultCount.textContent = (activeCategory || activeQuery)
          ? `${visible} of ${liveCount} tools`
          : `${liveCount} tools across ${categories.length} categories`;
      }
    }

    renderFilters(categories, (category) => {
      activeCategory = category;
      applyFilters();
    });

    applyFilters();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        activeQuery = e.target.value.trim().toLowerCase();
        applyFilters();
      });
    }
  } catch (err) {
    gridEl.innerHTML = `<p class="empty-state">Couldn't load tools right now. (${err.message})</p>`;
  }
}

async function initChrome() {
  initTheme();
  initBackToTop();
  try {
    const config = await loadJSON('config.json');
    applyConfig(config);
  } catch (err) {
    /* silent — page still renders with static fallback text */
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  if (!document.getElementById('tool-grid')) initChrome();
});
