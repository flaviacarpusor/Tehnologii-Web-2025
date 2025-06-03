const Resource = require('../../models/Resource');

async function handleVideos(req, res) {
  try {
    const videos = await Resource.findAllByType('video');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(videos));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}

module.exports = handleVideos;