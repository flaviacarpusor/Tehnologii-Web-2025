const Resource = require('../../models/Resource');
const User = require('../../models/User');

function toCSV(rows) {
  if (!rows.length) return '';
  const header = Object.keys(rows[0]).join(',');
  const data = rows.map(row =>
    Object.values(row).map(val =>
      `"${String(val).replace(/"/g, '""')}"`
    ).join(',')
  );
  return [header, ...data].join('\r\n');
}

async function handleExport(req, res, user) {
  const dbUser = await User.findById(user.userId);
  if (!dbUser || dbUser.role !== 'admin') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Acces interzis' }));
  }
  try {
    const resources = await Resource.getAll();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const format = url.searchParams.get('format') || 'json';

    if (format === 'csv') {
      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="resources-export.csv"'
      });
      res.end(toCSV(resources));
    } else {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="resources-export.json"'
      });
      res.end(JSON.stringify(resources, null, 2));
    }
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare la export' }));
  }
}

module.exports = handleExport;