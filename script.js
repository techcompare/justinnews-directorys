async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function toolCard(tool) {
  const a = document.createElement('a');
  const isLive = (tool.status || 'live').toLowerCase() === 'live';
  a.className = 'tool-card' + (isLive ? '' : ' coming');
  a.href = isLive ? tool.url : '#';
  if (isLive) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  a.dataset.category = tool.category;
  a.dataset.search = (tool.name + ' ' + tool.description + ' ' + tool.category).toLowerCase();

  a.innerHTML = `
    <div class="tool-card-top">
      <div class="tool-icon">${tool.icon || tool.category.slice(0, 3).toUpperCase()}</div>
      <span class="tool-badge ${isLive ? 'live' : 'soon'}">${isLive ? 'Live' : 'Coming soon'}</span>
    </div>
    <h3>${tool.name}</h3>
    <p>${tool.description}</p>
    <span class="tool-cta">${isLive ? 'Open tool \u2192' : 'Not live yet'}</span>
  `;
  return a;
}

function renderCategoryCards(tools) {
  const grid = document.getElementById('category-grid');
  if (!grid) return;
  const counts = {};
  tools.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });

  grid.innerHTML = '';
  Object.entries(counts).forEach(([cat, count]) => {
    const btn = document.createElement('button');
    btn.className = 'category-card';
    btn.innerHTML = `<span class="cat-name">${cat}</span><span class="cat-count">${count} tool${count === 1 ? '' : 's'}</span>`;
    btn.addEventListener('click', () => {
      document.getElementById('tools').scrollIntoView({ behavior: 'smooth' });
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

async function init() {
  const gridEl = document.getElementById('tool-grid');
  if (!gridEl) return; // page without a tool grid (about/contact/privacy/terms)

  try {
    const [config, tools] = await Promise.all([
      loadJSON('config.json'),
      loadJSON('tools.json'),
    ]);
    applyConfig(config);

    const liveCount = tools.filter((t) => (t.status || 'live').toLowerCase() === 'live').length;
    const categories = [...new Set(tools.map((t) => t.category))];

    const statTool = document.getElementById('stat-tool-count');
    const statCat = document.getElementById('stat-cat-count');
    if (statTool) statTool.textContent = liveCount;
    if (statCat) statCat.textContent = categories.length;

    gridEl.innerHTML = '';
    tools.forEach((tool) => gridEl.appendChild(toolCard(tool)));

    renderCategoryCards(tools);

    const emptyState = document.getElementById('empty-state');
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
    }

    renderFilters(categories, (category) => {
      activeCategory = category;
      applyFilters();
    });

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

// Sitewide config also applies on non-listing pages (about/contact/privacy/terms)
async function initChrome() {
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
