document.addEventListener('DOMContentLoaded', () => {
  async function loadResources() {
    const topic = document.getElementById('topic').value.trim();
    const type = document.getElementById('type').value;
    let endpoint = 'http://localhost:3000/resources/all';
    const params = [];
    if (type) params.push(`type=${type}`);
    if (topic) params.push(`topic=${encodeURIComponent(topic)}`);
    if (params.length) endpoint += '?' + params.join('&');

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const results = document.getElementById('results');
      results.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        results.innerHTML = '<p>Nicio resursă găsită.</p>';
        return;
      }

      // grupare pe tip
      const typeOrder = ['news', 'video', 'image', 'document'];
      const groupedByType = {};
      typeOrder.forEach(type => groupedByType[type] = {});

      data.forEach(item => {
        if (!groupedByType[item.type]) return; 
        if (!groupedByType[item.type][item.source]) groupedByType[item.type][item.source] = [];
        groupedByType[item.type][item.source].push(item);
      });

      // creeaza coloane pentru fiecare tip si sursa
      const grid = document.createElement('div');
      grid.style.display = 'flex';
      grid.style.gap = '2em';
      grid.style.flexWrap = 'wrap';

      typeOrder.forEach(type => {
        if (!groupedByType[type]) return;
        Object.entries(groupedByType[type]).forEach(([source, items]) => {
          //sorteaza dupa data
          items.sort((a, b) => new Date(b.import_date) - new Date(a.import_date));

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
            <div class="source-header" style="font-size:1.2em;font-weight:bold;margin-bottom:0.7em;background:#222;color:#fff;padding:0.5em 1em;border-radius:8px 8px 0 0; cursor: pointer;">
              <a href="${items[0].homepage || '#'}" target="_blank" style="color: inherit; text-decoration: none; display: block;">
                ${source} <span style="font-size:0.8em;font-weight:normal;background:#eee;color:#222;padding:0.2em 0.7em;border-radius:5px;margin-left:0.7em;">${items[0].type}</span>
              </a>
            </div>
            <ul class="source-list" style="list-style:none;padding:0;margin:0;max-height:400px;overflow-y:auto;"></ul>
          `;
          const ul = col.querySelector('.source-list');
          items.forEach(item => {
            const li = document.createElement('li');
            const importDate = new Date(item.import_date);
            const now = new Date();
            const diffMs = now - importDate;
            const diffM = Math.floor(diffMs / (1000 * 60));
            const diffH = Math.floor(diffM / 60);
            const diffD = Math.floor(diffH / 24);
            let timeLabel = '';
            if (diffM < 60) timeLabel = `${diffM}m`;
            else if (diffH < 24) timeLabel = `${diffH}h`;
            else timeLabel = `${diffD}d`;

            li.style.marginBottom = '0.5em';
            li.innerHTML = `<span style="color:#888;margin-right:0.5em;">${timeLabel}</span>
              <a href="${item.url}" target="_blank" style="color:#0077cc;text-decoration:none;">${item.title}</a>`;
            ul.appendChild(li);
          });
          grid.appendChild(col);
        });
      });

      results.appendChild(grid);
    } catch (err) {
      console.error('Eroare la încărcarea resurselor:', err);
      document.getElementById('results').innerHTML = '<p>Eroare la încărcare. Verifică consola.</p>';
    }
  }

  document.getElementById('loadNewsBtn').addEventListener('click', loadResources);

  loadResources();
});
const recentItems = items.filter(item => {
  const importDate = new Date(item.import_date);
  return importDate > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
});
