const pool = require('../config/database');

const sources = [
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', type: 'rss', name: 'NYTimes Tech' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', type: 'rss', name: 'BBC Tech' }
  // adauga aici alte surse publice
];

async function seedSources() {
  for (const src of sources) {
    await pool.query(
      `INSERT INTO user_sources (user_id, source_url, source_type, source_name)
       VALUES (NULL, $1, $2, $3)
       ON CONFLICT (source_url) DO NOTHING`,
      [src.url, src.type, src.name]
    );
  }
  console.log('Surse publice inserate!');
  process.exit();
}

seedSources();