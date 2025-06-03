
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('loadNewsBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const topic = document.getElementById('topic').value.trim();
    const type = document.getElementById('type').value;

    // Construim URL-ul în funcție de tip
    const endpoint = type ? `/resources/${type}?topic=${encodeURIComponent(topic)}` : `/resources/all?topic=${encodeURIComponent(topic)}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      const results = document.getElementById('results');
      results.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        results.innerHTML = '<p>Nicio resursă găsită.</p>';
        return;
      }

      data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
          <h3>${item.title || 'Fără titlu'}</h3>
          <p><a href="${item.url}" target="_blank">${item.url}</a></p>
        `;
        results.appendChild(card);
      });
    } catch (err) {
      console.error('Eroare la încărcarea resurselor:', err);
      document.getElementById('results').innerHTML = '<p>Eroare la încărcare. Verifică consola.</p>';
    }
  });
});
