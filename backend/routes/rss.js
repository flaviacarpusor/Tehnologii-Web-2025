const pool = require('../config/database');

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function handleFilteredRss(req, res) {
  // Parseaza query-urile din URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const type = url.searchParams.get('type');
  const topic = url.searchParams.get('topic');

  let where = [`visibility = 'public'`];
  let params = [];
  let paramIndex = 1;

  if (type) {
    where.push(`type = $${paramIndex}`);
    params.push(type);
    paramIndex++;
  }
  if (topic) {
    where.push(`(
      topic ILIKE $${paramIndex} OR
      title ILIKE $${paramIndex} OR
      description ILIKE $${paramIndex}
    )`);
    params.push(`%${topic}%`);
    paramIndex++;
  }

  const query = `
    SELECT title, url, description, import_date, source, type
    FROM resources
    WHERE ${where.join(' AND ')}
    ORDER BY import_date DESC
    LIMIT 100
  `;
  const result = await pool.query(query, params);

  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>ReT RSS filtrat</title>
    <link>http://localhost:3000/resources/rss</link>
    <description>Feed cu resurse filtrate</description>
`;

  for (const item of result.rows) {
    xml += `    <item>
      <title>${escapeXml(item.title || '')}</title>
      <link>${escapeXml(item.url || '')}</link>
      <description>${escapeXml(item.description || '')}</description>
      <pubDate>${escapeXml(item.import_date ? new Date(item.import_date).toUTCString() : '')}</pubDate>
      <category>${escapeXml(item.type || '')}</category>
      <author>${escapeXml(item.source || '')}</author>
    </item>
`;
  }

  xml += `  </channel>
</rss>`;

  res.writeHead(200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
  res.end(xml);
}

module.exports = handleFilteredRss;