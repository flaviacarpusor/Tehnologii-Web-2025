const pool = require('../config/database');

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[c]));
}

async function handleRss(req, res) {
  
  const result = await pool.query(
    `SELECT title, url, description, import_date, source, type
     FROM resources
     WHERE visibility = 'public'
     ORDER BY import_date DESC
     LIMIT 100`
  );

  res.writeHead(200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
  res.write(`<?xml version="1.0" encoding="UTF-8"?>\n`);
  res.write(`<rss version="2.0"><channel>
    <title>ReT Mash-up RSS</title>
    <link>http://localhost:3000/resources/rss</link>
    <description>Feed agregat cu ultimele resurse grupate pe sursă</description>
  `);

  
  const grouped = {};
  for (const item of result.rows) {
    if (!grouped[item.source]) grouped[item.source] = [];
    grouped[item.source].push(item);
  }

  for (const [source, items] of Object.entries(grouped)) {
    
    res.write(`<item>
      <title>${escapeXml(source)}</title>
      <description><![CDATA[
        <ul>
        ${items.slice(0, 10).map(i =>
          `<li><a href="${i.url}">${escapeXml(i.title)}</a> (${i.type}, ${i.import_date.toISOString().slice(0, 10)})</li>`
        ).join('\n')}
        </ul>
      ]]></description>
      <pubDate>${items[0].import_date.toUTCString()}</pubDate>
    </item>\n`);
  }

  res.write(`</channel></rss>`);
  res.end();
}

module.exports = handleRss;