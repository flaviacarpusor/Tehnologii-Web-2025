const UserPreference = require('../../models/Preference');

async function handlePreferences(req, res, user) {
  if (req.method === 'GET') {
    // Listare preferinte
    const prefs = await UserPreference.getByUser(user.userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(prefs));
  } else if (req.method === 'POST') {
    // Adaugare preferinta
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { resource_type, topic } = JSON.parse(body);
        if (!resource_type || !topic) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Lipsesc datele' }));
        }
        const pref = await UserPreference.add(user.userId, resource_type, topic);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pref));
      } catch (e) {
        console.error('Eroare la parsarea body-ului sau la adaugare preferinta:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Body invalid' }));
      }
    });
  } else if (req.method === 'DELETE') {
    // Stergere preferinta
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');
    if (!id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Lipsește id preferință' }));
    }
    await UserPreference.remove(user.userId, id);
    res.writeHead(204);
    res.end();
  } else {
    res.writeHead(405);
    res.end();
  }
}

async function updatePreferenceWeight(req, res) {
  try {
    const preferenceId = req.body.preferenceId;
    const userId = req.user.userId; // din middleware-ul de autentificare
    const newWeight = req.body.newWeight;

    if (!preferenceId || !newWeight) {
      return res.status(400).json({ error: 'Câmpuri lipsă' });
    }

    const updatedPreference = await UserPreference.updateWeight(preferenceId, userId, newWeight);
    res.status(200).json(updatedPreference);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Eroare server' });
  }
}

module.exports = { handlePreferences, updatePreferenceWeight };