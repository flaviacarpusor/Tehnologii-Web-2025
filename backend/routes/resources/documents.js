const Resource = require('../../models/Resource');

async function handleDocuments(req, res) {
  try {
    const documents = await Resource.findAllByType('document');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(documents));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}

module.exports = handleDocuments;