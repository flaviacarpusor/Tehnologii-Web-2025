const pool = require('../config/database');
const Parser = require('rss-parser');
const parser = new Parser();
const fetch = require('node-fetch'); 

async function importFromPublicSources() {
  const sources = await pool.query(
    `SELECT id, source_url, source_type FROM user_sources WHERE user_id IS NULL AND active = true`
  );
  for (const src of sources.rows) {
    if (src.source_type === 'rss') {
      const feed = await parser.parseURL(src.source_url);
      for (const item of feed.items) {
        await pool.query(
          `INSERT INTO resources (type, title, url, description, topic, visibility, source_id)
           VALUES ('news', $1, $2, $3, $4, 'public', $5)
           ON CONFLICT (url) DO NOTHING`,
          [item.title, item.link, item.contentSnippet || '', item.categories ? item.categories[0] : null, src.id]
        );
      }
    } else if (src.source_type === 'api') {
      try {
        const response = await fetch(src.source_url);
        const data = await response.json();

        // Acceptă doar dacă data este un array și fiecare item are câmpurile potrivite
        if (Array.isArray(data)) {
          for (const item of data) {
            if (
              typeof item.title === 'string' &&
              typeof item.url === 'string'
            ) {
              await pool.query(
                `INSERT INTO resources (type, title, url, description, topic, visibility, source_id)
                 VALUES ('news', $1, $2, $3, $4, 'public', $5)
                 ON CONFLICT (url) DO NOTHING`,
                [item.title, item.url, item.description || '', item.topic || null, src.id]
              );
            }
          }
        } else {
          console.warn(`Sursa API ${src.source_url} nu este standardizată (nu returnează array de obiecte cu title și url).`);
        }
      } catch (err) {
        console.error(`Eroare la importul din API ${src.source_url}:`, err.message);
      }
    }
  }
  console.log('Import din surse publice finalizat!');
}

module.exports = { importFromPublicSources };