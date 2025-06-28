document.addEventListener('DOMContentLoaded', () => {
  // verifica token
  const token = localStorage.getItem('token');
  const loginLink = document.querySelector('nav a[href="login.html"]');
  const registerLink = document.querySelector('nav a[href="register.html"]');
  const logoutLink = document.getElementById('logout');

  // afiseaza/ascunde linkuri in functie de login
  if (token) {
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline-block';
  } else {
    if (loginLink) loginLink.style.display = 'inline-block';
    if (registerLink) registerLink.style.display = 'inline-block';
    if (logoutLink) logoutLink.style.display = 'none';
  }

  // logout
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      alert('Te-ai delogat de pe pagină!');
      window.location.href = 'index.html';
    });
  }

  // incarca resurse filtrate
  async function loadResources() {
    const topic = document.getElementById('topic').value.trim();
    const type = document.getElementById('type').value;
    let endpoint = 'http://localhost:3000/resources/all';
    const params = [];
    if (type) params.push(`type=${type}`);
    if (topic) params.push(`topic=${encodeURIComponent(topic)}`);
    if (params.length) endpoint += '?' + params.join('&');

    try {
      // fetch resurse
      const res = await fetch(endpoint);
      const data = await res.json();
      const results = document.getElementById('results');
      results.innerHTML = '';

      // nimic gasit
      if (!Array.isArray(data) || data.length === 0) {
        results.innerHTML = '<p>Nicio resursă  găsită.</p>';
        return;
      }

      // grupeaza pe tip
      const typeOrder = ['news', 'video', 'image', 'document'];
      const groupedByType = {};
      typeOrder.forEach(type => groupedByType[type] = {});

      data.forEach(item => {
        if (!groupedByType[item.type]) return;
        if (!groupedByType[item.type][item.source]) groupedByType[item.type][item.source] = [];
        groupedByType[item.type][item.source].push(item);
      });

      // grid cu coloane pe tip si sursa
      const grid = document.createElement('div');
      grid.style.display = 'flex';
      grid.style.gap = '2em';
      grid.style.flexWrap = 'wrap';

      typeOrder.forEach(type => {
        if (!groupedByType[type]) return;
        Object.entries(groupedByType[type]).forEach(([source, items]) => {
          // sorteaza dupa data
          items.sort((a, b) => new Date(b.import_date) - new Date(a.import_date));

          // coloana pentru sursa
          const col = document.createElement('div');
          col.className = 'source-column';
          col.style.background = '#fff';
          col.style.borderRadius = '10px';
          col.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
          col.style.padding = '1em 1.5em';
          col.style.minWidth = '300px';
          col.style.flex = '1 1 300px';
          col.style.marginBottom = '2em';

          // header sursa si tip
          col.innerHTML = `
            <div class="source-header" style="font-size:1.2em;font-weight:bold;margin-bottom:0.7em;background:#222;color:#fff;padding:0.5em 1em;border-radius:8px 8px 0 0; cursor: pointer;">
              <a href="${items[0].homepage || '#'}" target="_blank" style="color: inherit; text-decoration: none; display: block;">
                ${source} <span style="font-size:0.8em;font-weight:normal;background:#eee;color:#222;padding:0.2em 0.7em;border-radius:5px;margin-left:0.7em;">${items[0].type}</span>
              </a>
            </div>
            <ul class="source-list" style="list-style:none;padding:0;margin:0;max-height:400px;overflow-y:auto;"></ul>
          `;
          const ul = col.querySelector('.source-list');
          // lista resurse
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

      // pune gridul in pagina
      results.appendChild(grid);
    } catch (err) {
      // eroare fetch
      console.error('eroare la incarcarea resurselor:', err);
      document.getElementById('results').innerHTML = '<p>eroare la incarcare. verifica consola.</p>';
    }
  }

  // buton incarcare
  document.getElementById('loadNewsBtn').addEventListener('click', loadResources);

  // incarcare automata la load
  loadResources();

  const btnRss = document.getElementById('generate-rss-btn');
  if (btnRss) {
    btnRss.onclick = async function() {
      const topic = document.getElementById('topic').value;
      const type = document.getElementById('type').value;
      let url = 'http://localhost:3000/resources/rss?';
      if (topic) url += `topic=${encodeURIComponent(topic)}&`;
      if (type) url += `type=${encodeURIComponent(type)}`;
      const res = await fetch(url);
      const xml = await res.text();
      const blob = new Blob([xml], { type: 'application/rss+xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'ret-filtrat-feed.xml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }
});

// login automat cu reset token
document.addEventListener('DOMContentLoaded', async () => {
  // daca exista resetToken in url, login automat
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get('resetToken');
  if (resetToken) {
    try {
      const res = await fetch('http://localhost:3000/auth/reset-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'profile.html';
      } else {
        alert(data.error || 'Token invalid sau expirat!');
        window.location.href = 'login.html';
      }
    } catch {
      alert('Eroare la autentificare!');
      window.location.href = 'login.html';
    }
  }
});

