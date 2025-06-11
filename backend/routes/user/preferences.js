const UserPreference = require('../../models/Preference');

// aici se ocupa de toate preferintele userului, ca un fel de meniu la restaurant
async function handlePreferences(req, res, user) {
  if (req.method === 'GET') {
    // daca userul vrea sa vada ce preferinte are deja (meniul lui personal)
    const prefs = await UserPreference.getByUser(user.userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(prefs));
  } else if (req.method === 'POST') {
    // daca userul vrea sa adauge o noua preferinta (descopera ceva nou si vrea sa-l puna pe lista)
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        // extragem din body ce vrea userul sa adauge (topic si tipul resursei)
        const { resource_type, topic } = JSON.parse(body);
        if (!resource_type || !topic) {
          // daca lipseste ceva, trimitem userul la plimbare cu un mesaj clar
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Lipsesc datele' }));
        }
      
        // verificam daca nu cumva a mai pus deja preferinta asta (nu vrem dubluri ca la bingo)
        const exists = await UserPreference.getByUserAndTopicAndType(user.userId, topic, resource_type);
        if (exists) {
          // daca exista deja, ii spunem frumos ca nu merge sa puna de doua ori acelasi lucru
          res.writeHead(409, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Preferinta exista deja!' }));
        }
        // daca totul e ok, adaugam preferinta in baza de date (ca la colectie noua de stickere)
        const pref = await UserPreference.add(user.userId, resource_type, topic);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pref));
      } catch (e) {
        // daca ceva nu merge (de exemplu body-ul nu e json valid), dam eroare si logam problema
        console.error('Eroare la parsarea body-ului sau la adaugare preferinta:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Body invalid' }));
      }
    });
  } else if (req.method === 'DELETE') {
    // daca userul s-a razgandit si vrea sa stearga o preferinta (nu mai vrea broccoli)
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');
    if (!id) {
      // daca nu primim id-ul preferintei, nu avem ce sterge
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Lipseste id preferinta' }));
    }
    // stergem preferinta din baza de date (adio, preferinta!)
    await UserPreference.remove(user.userId, id);
    res.writeHead(204); // 204 = totul ok, dar nu mai avem nimic de trimis inapoi
    res.end();
  } else {
    // daca vine cineva cu o metoda ciudata (PUT, PATCH, etc), ii dam cu 405 peste nas
    res.writeHead(405);
    res.end();
  }
}

// exportam functia ca sa o foloseasca si altii, nu tinem doar pentru noi
module.exports = { handlePreferences };