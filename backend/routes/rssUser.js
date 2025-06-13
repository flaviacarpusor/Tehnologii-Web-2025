const pool = require('../config/database');
const UserPreference = require('../models/Preference');
const { verifyJWT } = require('../middleware/auth');

// aici facem un RSS personalizat pentru fiecare user, ca la radio dar doar cu ce vrei tu
async function handleUserRss(req, res) {
  verifyJWT(req, res, async (user) => {
    // 1. luam preferintele userului din baza de date (ca sa stim ce vrea sa asculte)
    const prefs = await UserPreference.getByUser(user.userId);
    console.log('Preferințe user:', prefs); // <-- Adaugă această linie
    if (!prefs || prefs.length === 0) {
      res.writeHead(200, { 'Content-Type': 'application/rss+xml' });
      res.end(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Feed personalizat ReT</title>
    <description>Nu ai preferințe setate. Adaugă preferințe pentru a primi recomandări!</description>
    <link>http://localhost:3000/profile.html</link>
  </channel>
</rss>`);
      return;
    }

    // 2. construim filtrele pentru SQL ca sa luam doar resursele care se potrivesc cu preferintele userului
    // practic facem un WHERE topic IN (...) AND type IN (...) ca la lista de cumparaturi
    const topics = prefs.map(p => `'${p.topic.replace(/'/g, "''")}'`).join(',');
    const types = prefs.map(p => `'${p.resource_type.replace(/'/g, "''")}'`).join(',');

    const query = `
      SELECT title, url, description, import_date, source, type
      FROM resources
      WHERE topic IN (${topics}) AND type IN (${types}) AND visibility = 'public'
      ORDER BY import_date DESC
      LIMIT 100
    `;
    const result = await pool.query(query);

    // 3. generam RSS-ul efectiv, ca sa poata userul sa-si citeasca stirile preferate la cafea
    res.writeHead(200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
    res.write(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
      <title>ReT RSS personalizat</title>
      <link>http://localhost:3000/resources/rss-user</link>
      <description>Feed cu resurse pe baza preferintelor tale</description>
    `);

    // bagam fiecare resursa ca un <item> in RSS, ca la pomana cu sarmale
    for (const item of result.rows) {
      res.write(`<item>
        <title><![CDATA[${item.title}]]></title>
        <link>${item.url}</link>
        <description><![CDATA[${item.description}]]></description>
        <pubDate>${item.import_date}</pubDate>
        <category>${item.type}</category>
        <source>${item.source}</source>
      </item>`);
    }
    // inchidem canalul, ca la final de emisiune
    res.write('</channel></rss>');
    res.end();
  });
}

// exportam functia ca sa poata fi folosita si de alte rute, nu tinem doar pentru noi
module.exports = handleUserRss;