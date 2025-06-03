const Resource = require('../../models/Resource');

async function handleSearch(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const keyword = url.searchParams.get('q');
    if (!keyword) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Lipseste parametrul q' }));
    }
    const results = await Resource.searchByKeyword(keyword);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}

module.exports = handleSearch;