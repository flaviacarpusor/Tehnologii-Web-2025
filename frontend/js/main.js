document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token'); // Verificăm dacă există token-ul
  const loginLink = document.querySelector('nav a[href="login.html"]');
  const registerLink = document.querySelector('nav a[href="register.html"]');
  const logoutLink = document.getElementById('logout'); // Identificăm linkul Logout

  if (token) {
    // Dacă utilizatorul este logat, ascundem linkurile Login și Register
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline-block'; // Afișăm Logout
  } else {
    // Dacă utilizatorul nu este logat, afișăm linkurile Login și Register
    if (loginLink) loginLink.style.display = 'inline-block';
    if (registerLink) registerLink.style.display = 'inline-block';
    if (logoutLink) logoutLink.style.display = 'none'; // Ascundem Logout
  }

  // Logout logic
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token'); // Ștergem token-ul
      alert('Te-ai delogat cu succes!'); // Mesaj de confirmare
      window.location.href = 'index.html'; // Redirect către pagina principală
    });
  }

  // functia magica ce incarca resursele in functie de filtrele userului
  async function loadResources() {
    const topic = document.getElementById('topic').value.trim();
    const type = document.getElementById('type').value;
    let endpoint = 'http://localhost:3000/resources/all';
    const params = [];
    if (type) params.push(`type=${type}`);
    if (topic) params.push(`topic=${encodeURIComponent(topic)}`);
    if (params.length) endpoint += '?' + params.join('&');

    try {
      // cerem resursele de la backend, ca la fast-food
      const res = await fetch(endpoint);
      const data = await res.json();
      const results = document.getElementById('results');
      results.innerHTML = '';

      // daca nu gasim nimic, anuntam userul ca a venit degeaba
      if (!Array.isArray(data) || data.length === 0) {
        results.innerHTML = '<p>Nici o resursa gasita.</p>';
        return;
      }

      // grupam resursele pe tipuri, ca la rafturile din supermarket
      const typeOrder = ['news', 'video', 'image', 'document'];
      const groupedByType = {};
      typeOrder.forEach(type => groupedByType[type] = {});

      data.forEach(item => {
        if (!groupedByType[item.type]) return; 
        if (!groupedByType[item.type][item.source]) groupedByType[item.type][item.source] = [];
        groupedByType[item.type][item.source].push(item);
      });

      // facem gridul cu coloane pentru fiecare tip si sursa, ca sa fie totul frumos si ordonat
      const grid = document.createElement('div');
      grid.style.display = 'flex';
      grid.style.gap = '2em';
      grid.style.flexWrap = 'wrap';

      typeOrder.forEach(type => {
        if (!groupedByType[type]) return;
        Object.entries(groupedByType[type]).forEach(([source, items]) => {
          // sortam resursele dupa data, ca sa fie cele mai noi primele
          items.sort((a, b) => new Date(b.import_date) - new Date(a.import_date));

          // facem o coloana pentru fiecare sursa, cu design de lux
          const col = document.createElement('div');
          col.className = 'source-column';
          col.style.background = '#fff';
          col.style.borderRadius = '10px';
          col.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
          col.style.padding = '1em 1.5em';
          col.style.minWidth = '300px';
          col.style.flex = '1 1 300px';
          col.style.marginBottom = '2em';

          // header cu numele sursei si tipul de resursa, ca sa stie userul ce citeste
          col.innerHTML = `
            <div class="source-header" style="font-size:1.2em;font-weight:bold;margin-bottom:0.7em;background:#222;color:#fff;padding:0.5em 1em;border-radius:8px 8px 0 0; cursor: pointer;">
              <a href="${items[0].homepage || '#'}" target="_blank" style="color: inherit; text-decoration: none; display: block;">
                ${source} <span style="font-size:0.8em;font-weight:normal;background:#eee;color:#222;padding:0.2em 0.7em;border-radius:5px;margin-left:0.7em;">${items[0].type}</span>
              </a>
            </div>
            <ul class="source-list" style="list-style:none;padding:0;margin:0;max-height:400px;overflow-y:auto;"></ul>
          `;
          const ul = col.querySelector('.source-list');
          // punem fiecare stire ca un link in lista, cu ora ca la breaking news
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

      // la final, punem gridul in pagina, ca sa se bucure userul de toate stirile
      results.appendChild(grid);
    } catch (err) {
      // daca explodeaza ceva, anuntam userul si lasam consola pentru debugging
      console.error('eroare la incarcarea resurselor:', err);
      document.getElementById('results').innerHTML = '<p>eroare la incarcare. verifica consola.</p>';
    }
  }

  // cand apesi pe butonul de incarcare, pornim magia
  document.getElementById('loadNewsBtn').addEventListener('click', loadResources);

  // incarcam automat la deschiderea paginii, ca sa nu astepte userul
  loadResources();
});

