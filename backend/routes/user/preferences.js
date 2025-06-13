const UserPreference = require('../../models/Preference');

// handler pentru preferintele userului
async function handlePreferences(req, res, user) {
  if (req.method === 'GET') {
    // returneaza preferintele userului
    const prefs = await UserPreference.getByUser(user.userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(prefs));
  } else if (req.method === 'POST') {
    // adauga o noua preferinta
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { resource_type, topic } = JSON.parse(body);
        if (!resource_type || !topic) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'lipsesc datele' }));
        }
        // verifica daca preferinta exista deja
        const exists = await UserPreference.getByUserAndTopicAndType(user.userId, topic, resource_type);
        if (exists) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'preferinta exista deja' }));
        }
        // adauga preferinta
        const pref = await UserPreference.add(user.userId, resource_type, topic);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pref));
      } catch (e) {
        console.error('eroare la parsare body sau adaugare preferinta:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'body invalid' }));
      }
    });
  } else if (req.method === 'DELETE') {
    // sterge o preferinta
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');
    if (!id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'lipseste id preferinta' }));
    }
    await UserPreference.remove(user.userId, id);
    res.writeHead(204);
    res.end();
  } else {
    // metoda nepermisa
    res.writeHead(405);
    res.end();
  }
}

module.exports = { handlePreferences };