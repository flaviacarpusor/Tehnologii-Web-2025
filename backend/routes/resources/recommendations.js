const Resource = require('../../models/Resource');
const Preference = require('../../models/Preference');

async function handleRecommendations(req, res, user) {
  try {
    
    const prefs = await Preference.getByUser(user.userId);

    let allResults = [];
    for (const pref of prefs) {
      const results = await Resource.findByTopicAndType(pref.topic, pref.resource_type);
      allResults = allResults.concat(results);
    }

   
    const unique = [];
    const seen = new Set();
    for (const item of allResults) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(unique));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}

module.exports = handleRecommendations;