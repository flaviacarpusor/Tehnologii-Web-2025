const UserSource = require('../../models/UserSource');

// Listare surse publice
async function handleSources(req, res, user) {
  if (req.method === 'GET') {
    const sources = await UserSource.getPublic();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(sources));
  }
  res.writeHead(405);
  res.end();
}

module.exports = handleSources;