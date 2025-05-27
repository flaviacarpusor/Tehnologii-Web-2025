
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('loadNewsBtn');
  if (btn) {
    btn.addEventListener('click', async () => {
      const topicInput = document.getElementById('topic');
      const topic = topicInput.value;
      const res = await fetch(`../backend/api/resources/news.php?topic=${encodeURIComponent(topic)}`);
      const data = await res.json();
      const results = document.getElementById('results');
      results.innerHTML = '';
      data.forEach(item => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${item.title}</strong> - <a href="${item.url}" target="_blank">${item.url}</a>`;
        results.appendChild(p);
      });
    });
  }
});