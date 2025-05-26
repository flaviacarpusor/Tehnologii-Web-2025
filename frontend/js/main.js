
// API wrapper din api.js se așteaptă: apiGet(path) și apiPost(path, data)

document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js încărcat cu succes!');
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Încărcare resurse...';
  
    try {
      // Fetch popular resources (fără autentificare) sau recomandări dacă ești logat
      const resources = await apiGet('/api/resources');
      const app = document.getElementById('app');
  
      if (!resources || resources.length === 0) {
        app.innerHTML = '<p>Nu există resurse de afișat.</p>';
      } else {
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
  
        resources.forEach(r => {
          const li = document.createElement('li');
          li.style.marginBottom = '1rem';
  
          const a = document.createElement('a');
          a.href = r.url;
          a.textContent = r.title;
          a.target = '_blank';
          a.style.fontSize = '1.1rem';
          a.style.fontWeight = 'bold';
          a.style.textDecoration = 'none';
          a.style.color = '#007acc';
          li.appendChild(a);
  
          if (r.description) {
            const p = document.createElement('p');
            p.textContent = r.description;
            p.style.margin = '0.25rem 0 0';
            li.appendChild(p);
          }
  
          ul.appendChild(li);
        });
  
        app.innerHTML = '';
        app.appendChild(ul);
      }
  
      statusEl.textContent = 'Resurse încărcate';
    } catch (err) {
      // Afișează eroarea în consolă și actualizează UI
      console.error(err);
      statusEl.textContent = 'Eroare la încărcarea resurselor';
    }
  });
  