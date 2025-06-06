const Resource = require('../../models/Resource');
const User = require('../../models/User');

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]);
    return obj;
  });
}

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
      let resources;
      const contentType = req.headers['content-type'];
      if (contentType && contentType.includes('csv')) {
        resources = parseCSV(body);
      } else {
        resources = JSON.parse(body);
      }
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