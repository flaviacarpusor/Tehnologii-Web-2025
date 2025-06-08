async function handleStats(req, res, user) {
  const dbUser = await User.findById(user.userId);
  if (!dbUser || dbUser.role !== 'admin') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Acces interzis' }));
  }
  try {
    const userCount = await User.getCount();
    const resourceCount = await Resource.getCount();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ userCount, resourceCount }));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}
module.exports = handleStats;