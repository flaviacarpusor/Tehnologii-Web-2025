const Resource = require('../../models/Resource');


async function handleRecommendations(req, res) {
  try {
    // Exemplu: topicul preferat ar putea veni din query sau din user (daca ai JWT)
    const url = new URL(req.url, `http://${req.headers.host}`);
    const topic = url.searchParams.get('topic') || 'general';

    const recommendations = await Resource.findByTopic(topic);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(recommendations));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}

module.exports = handleRecommendations;