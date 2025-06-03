const Resource = require('../../models/Resource');

async function handleNews(req, res) {
  try {
    const news = await Resource.findAllByType('news');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(news));
  } catch (e) {
    console.error(e); 
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}

module.exports = handleNews;