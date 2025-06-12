const Resource = require('../../models/Resource');
const User = require('../../models/User');

async function handleAdminResources(req, res, user) {
  const dbUser = await User.findById(user.userId);
  if (!dbUser || dbUser.role !== 'admin') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Acces interzis' }));
  }

  if (req.method === 'GET') {
    // Listare resurse
    const resources = await Resource.getAll();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(resources));
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');
    if (!id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Lipsește id resursă' }));
    }
    await Resource.delete(id);
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { id, ...fields } = JSON.parse(body);
        if (!id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Lipsește id resursă' }));
        }
        const updated = await Resource.update(id, fields);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updated));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Body invalid' }));
      }
    });
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { type, title, url, description, topic, keywords, visibility, source } = data;
        const resource = await Resource.create({ type, title, url, description, topic, keywords, source, visibility });
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(resource));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Body invalid' }));
      }
    });
    return;
  }

  res.writeHead(405);
  res.end();
}

module.exports = handleAdminResources;