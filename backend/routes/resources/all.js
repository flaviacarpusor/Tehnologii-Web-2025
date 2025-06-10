const Resource = require('../../models/Resource');

async function handleAllResources(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const type = url.searchParams.get('type');
    const topic = url.searchParams.get('topic');
    
    let resources;
    
    if (topic && type) {
      resources = await Resource.findByTopicAndType(topic, type);
    } else if (topic) {
      resources = await Resource.findByTopic(topic);
    } else if (type) {
      resources = await Resource.findAllByType(type);
    } else {
      resources = await Resource.getAll();
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(resources));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare la încărcarea resurselor' }));
  }
}

module.exports = handleAllResources;