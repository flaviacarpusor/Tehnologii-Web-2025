const pool = require('../config/database');

// functie magica ce scapa caracterele periculoase din XML, ca sa nu explodeze totul
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[c]));
}

// aici facem un RSS mash-up, adica un fel de ciorba cu de toate din toate sursele
async function handleRss(req, res) {
  // luam ultimele 100 de resurse publice din baza de date, ca la reduceri
  const result = await pool.query(
    `SELECT title, url, description, import_date, source, type
     FROM resources
     WHERE visibility = 'public'
     ORDER BY import_date DESC
     LIMIT 100`
  );

  // anuntam browserul ca urmeaza XML, nu pizza
  res.writeHead(200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
  res.write(`<?xml version="1.0" encoding="UTF-8"?>\n`);
  res.write(`<rss version="2.0"><channel>
    <title>ReT Mash-up RSS</title>
    <link>http://localhost:3000/resources/rss</link>
    <description>Feed agregat cu ultimele resurse grupate pe sursa</description>
  `);

  // grupam resursele pe sursa, ca la rafturile din supermarket
  const grouped = {};
  for (const item of result.rows) {
    if (!grouped[item.source]) grouped[item.source] = [];
    grouped[item.source].push(item);
  }

  // pentru fiecare sursa, facem un "item" mare cu lista de stiri din acea sursa
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

  // inchidem canalul, ca la final de emisiune la radio
  res.write(`</channel></rss>`);
  res.end();
}

// exportam functia ca sa poata fi chemata si de altii, nu doar de noi
module.exports = handleRss;