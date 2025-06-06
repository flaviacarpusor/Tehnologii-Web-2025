const Resource = require('../../models/Resource');
const UserPreference = require('../../models/Preference');


async function handleRecommendations(req, res, user) {
  try {
    const prefs = await UserPreference.getByUser(user.userId);

    if (!prefs || prefs.length === 0) {
      const recent = await Resource.findAllByType('news');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(recent));
    }

    const topics = prefs.map(p => p.topic);
    const types = prefs.map(p => p.resource_type);

    const recommendations = await Resource.findByTopicsAndTypes(topics, types);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(recommendations));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}

module.exports = handleRecommendations;