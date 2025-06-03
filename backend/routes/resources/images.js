const Resource = require('../../models/Resource');

async function handleImages(req, res) {
  try {
    const images = await Resource.findAllByType('image');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(images));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}

module.exports = handleImages;