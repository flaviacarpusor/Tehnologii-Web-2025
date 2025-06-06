const Resource = require('../../models/Resource');
const User = require('../../models/User'); 

async function handleExport(req, res, user) {
  const dbUser = await User.findById(user.userId);
  if (!dbUser || dbUser.role !== 'admin') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Acces interzis' }));
  }
  try {
    const resources = await Resource.getAll();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="resources-export.json"'
    });
    res.end(JSON.stringify(resources, null, 2));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare la export' }));
  }
}

module.exports = handleExport;