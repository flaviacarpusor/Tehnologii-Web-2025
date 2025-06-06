const Resource = require('../../models/Resource');
const User = require('../../models/User');

async function handleImport(req, res, user) {
    
  const dbUser = await User.findById(user.userId);
  if (!dbUser || dbUser.role !== 'admin') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Acces interzis' }));
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const resources = JSON.parse(body);
      if (!Array.isArray(resources)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Format invalid (trebuie array)' }));
      }
      for (const r of resources) {
        await Resource.create(r);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Import realizat cu succes' }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Eroare la import' }));
    }
  });
}

module.exports = handleImport;