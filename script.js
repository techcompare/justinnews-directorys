async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function toolRow(tool) {
  const a = document.createElement('a');
  const isLive = (tool.status || 'live').toLowerCase() === 'live';
  a.className = 'tool-row' + (isLive ? '' : ' coming');
  a.href = isLive ? tool.url : '#';
  if (isLive) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  a.dataset.category = tool.category;

  a.innerHTML = `
    <div class="tool-icon">${tool.icon || tool.category.slice(0, 3).toUpperCase()}</div>
    <div class="tool-body">
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
    </div>
    <div class="tool-meta">
      <span class="tool-cat">${tool.category}</span>
      <span class="tool-open">${isLive ? 'Open tool' : 'Coming soon'}</span>
    </div>
  `;
  return a;
}

function renderFilters(categories, onSelect) {
  const bar = document.getElementById('filters');
  bar.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'filter-btn active';
  all.textContent = 'All tools';
  all.addEventListener('click', () => selectFilter(all));
  bar.appendChild(all);

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat;
    btn.addEventListener('click', () => selectFilter(btn));
    bar.appendChild(btn);
  });

  function selectFilter(activeBtn) {
    [...bar.children].forEach((b) => b.classList.remove('active'));
    activeBtn.classList.add('active');
    onSelect(activeBtn.textContent === 'All tools' ? null : activeBtn.textContent);
  }
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
  const listEl = document.getElementById('tool-list');
  if (!listEl) return; // page without a tool list (about/privacy)

  try {
    const [config, tools] = await Promise.all([
      loadJSON('config.json'),
      loadJSON('tools.json'),
    ]);
    applyConfig(config);

    const liveCount = tools.filter((t) => (t.status || 'live').toLowerCase() === 'live').length;
    const categories = [...new Set(tools.map((t) => t.category))];

    document.getElementById('stat-tool-count').textContent = liveCount;
    document.getElementById('stat-cat-count').textContent = categories.length;

    listEl.innerHTML = '';
    tools.forEach((tool) => listEl.appendChild(toolRow(tool)));

    const emptyState = document.getElementById('empty-state');

    renderFilters(categories, (category) => {
      let visible = 0;
      [...listEl.children].forEach((row) => {
        const match = !category || row.dataset.category === category;
        row.classList.toggle('is-hidden', !match);
        if (match) visible += 1;
      });
      emptyState.style.display = visible === 0 ? 'block' : 'none';
    });
  } catch (err) {
    listEl.innerHTML = `<p class="empty-state">Couldn't load tools right now. (${err.message})</p>`;
  }
}

// Sitewide config also applies on non-listing pages (about/privacy) for the header/footer
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
  if (!document.getElementById('tool-list')) initChrome();
});
