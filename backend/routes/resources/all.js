const Resource = require('../../models/Resource');

async function handleAllResources(req, res) {
  try {
    const resources = await Resource.getAll();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(resources));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare la încărcarea resurselor' }));
  }
}

module.exports = handleAllResources;