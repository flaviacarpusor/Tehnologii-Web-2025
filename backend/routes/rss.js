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
  // Parsează query-urile din URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const type = url.searchParams.get('type');
  const topic = url.searchParams.get('topic');

  let where = [`visibility = 'public'`];
  if (type) where.push(`type = '${type.replace(/'/g, "''")}'`);
  if (topic) {
    const safeTopic = topic.replace(/'/g, "''");
    where.push(`(
    topic ILIKE '%${safeTopic}%' OR
    title ILIKE '%${safeTopic}%' OR
    description ILIKE '%${safeTopic}%'
  )`);
  }

  const query = `
    SELECT title, url, description, import_date, source, type
    FROM resources
    WHERE ${where.join(' AND ')}
    ORDER BY import_date DESC
    LIMIT 100
  `;
  const result = await pool.query(query);

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