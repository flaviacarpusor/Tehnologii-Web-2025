document.addEventListener('DOMContentLoaded', () => {
  async function loadResources() {
    const topic = document.getElementById('topic').value.trim();
    const type = document.getElementById('type').value;
    let endpoint = 'http://localhost:3000/resources/all';
    if (type) endpoint = `/resources/${type}`;
    if (topic) endpoint += `?topic=${encodeURIComponent(topic)}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const results = document.getElementById('results');
      results.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        results.innerHTML = '<p>Nicio resursă găsită.</p>';
        return;
      }

      // grupare pe sursa
      const grouped = {};
      data.forEach(item => {
        if (!grouped[item.source]) grouped[item.source] = [];
        grouped[item.source].push(item);
      });

      // creeaza coloane pentru fiecare sursa
      const grid = document.createElement('div');
      grid.style.display = 'flex';
      grid.style.gap = '2em';
      grid.style.flexWrap = 'wrap';

      Object.entries(grouped).forEach(([source, items]) => {
        const col = document.createElement('div');
        col.className = 'source-column';
        col.style.background = '#fff';
        col.style.borderRadius = '10px';
        col.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
        col.style.padding = '1em 1.5em';
        col.style.minWidth = '300px';
        col.style.flex = '1 1 300px';
        col.style.marginBottom = '2em';

        // header cu nume sursa
        col.innerHTML = `
          <div class="source-header" style="font-size:1.2em;font-weight:bold;margin-bottom:0.7em;background:#222;color:#fff;padding:0.5em 1em;border-radius:8px 8px 0 0;">
            ${source}
          </div>
          <ul class="source-list" style="list-style:none;padding:0;margin:0;"></ul>
        `;
        const ul = col.querySelector('.source-list');
        items.slice(0, 10).forEach(item => {
          const li = document.createElement('li');
          li.style.marginBottom = '0.5em';
          li.innerHTML = `<a href="${item.url}" target="_blank" style="color:#0077cc;text-decoration:none;">${item.title}</a>`;
          ul.appendChild(li);
        });
        grid.appendChild(col);
      });

      results.appendChild(grid);
    } catch (err) {
      console.error('Eroare la încărcarea resurselor:', err);
      document.getElementById('results').innerHTML = '<p>Eroare la încărcare. Verifică consola.</p>';
    }
  }

  const btn = document.getElementById('loadNewsBtn');
  if (btn) {
    btn.addEventListener('click', loadResources);
  }

  loadResources();
});
