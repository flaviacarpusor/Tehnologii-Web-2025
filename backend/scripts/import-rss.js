const pool = require('../config/database');
const Parser = require('rss-parser');
const parser = new Parser();

// === DEFINIRE SURSE RSS ===
const feeds = [
  // STIRI
  { type: 'news', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', topic: 'technology' },
  { type: 'news', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', topic: 'technology' },
  { type: 'news', url: 'http://rss.cnn.com/rss/edition.rss', topic: 'news' },

  // VIDEO (YouTube RSS)
  { type: 'video', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ', topic: 'tech' },
  { type: 'video', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8butISFwT-Wl7EV0hUK0BQ', topic: 'programming' },

  // IMAGINI
  { type: 'image', url: 'https://www.flickr.com/services/feeds/photos_public.gne?tags=nature&format=rss2', topic: 'nature' },
  { type: 'image', url: 'https://www.flickr.com/services/feeds/photos_public.gne?tags=architecture&format=rss2', topic: 'architecture' },
 
  // DOCUMENTE (arXiv RSS)
  { type: 'document', url: 'https://arxiv.org/rss/cs.AI', topic: 'artificial-intelligence' },
  { type: 'document', url: 'https://arxiv.org/rss/cs.CR', topic: 'cryptography' }
];

function truncate(str, n) {
  return typeof str === 'string' ? str.slice(0, n) : str;
}

function extractImageUrl(item) {
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url)
    return item['media:content']['$'].url;
  if (item.link && item.link.match(/\.(jpg|jpeg|png|gif)$/i)) return item.link;
  return null;
}

async function importAll() {
  for (const feed of feeds) {
    try {
      const parsed = await parser.parseURL(feed.url);
      let count = 0;
      for (const item of parsed.items) {
        let url = item.link;
        let title = truncate(item.title, 500);
        let description = truncate(item.contentSnippet || item.summary || item.description || '', 1000);
        let topic = feed.topic;
        let keywords = title.split(' ').slice(0, 5).join(', ');

        // Mapare speciala pentru imagini
        if (feed.type === 'image') {
          url = extractImageUrl(item) || item.link;
          title = truncate(item.title || item.description || 'Imagine', 500);
          description = truncate(item.description || '', 1000);
          keywords = (item.title || '').split(' ').slice(0, 5).join(', ');
        }

        // Mapare speciala pentru documente (arXiv)
        if (feed.type === 'document') {
          if (item.links && Array.isArray(item.links)) {
            const pdf = item.links.find(l => l.type === 'application/pdf');
            if (pdf) url = pdf.href;
          }
          description = truncate(item.summary || item.contentSnippet || '', 1000);
        }

    
        const exists = await pool.query('SELECT id FROM resources WHERE url = $1', [url]);
        if (exists.rows.length === 0 && url) {
          await pool.query(
            `INSERT INTO resources (type, title, url, description, topic, keywords, visibility)
             VALUES ($1, $2, $3, $4, $5, $6, 'public')`,
            [feed.type, title, url, description, topic, keywords]
          );
          count++;
        }
      }
      console.log(` ${feed.type.toUpperCase()}: ${count} resurse noi din ${feed.url}`);
    } catch (err) {
      console.log(` Eroare la ${feed.type} (${feed.url}): ${err.message}`);
    }
  }
  process.exit();
}

importAll();