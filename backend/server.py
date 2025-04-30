from http.server import HTTPServer, BaseHTTPRequestHandler
import os
import json
import mimetypes
from urllib.parse import urlparse, parse_qs

from db_manager import DatabaseManager
from auth_manager import AuthManager
from resource_fetcher import ResourceFetcher
from recommender import Recommender
from rss_generator import RSSGenerator
from admin import AdminManager

ROOT    = os.path.dirname(os.path.dirname(__file__))
FE_ROOT = os.path.join(ROOT, 'frontend')

db      = DatabaseManager()
auth    = AuthManager(db)
fetcher = ResourceFetcher(db)
recomm  = Recommender(db)
rss_gen = RSSGenerator(db)
adm     = AdminManager(db)


class RequestHandler(BaseHTTPRequestHandler):
    """
    REST-style HTTP handler for ReT.
    """

    # ───────────────────────────── GET ───────────────────────────────────
    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        params = parse_qs(parsed.query)

        if path == '/api/resources':
            uid = self._get_user_id()
            cat = params.get('category', [None])[0]
            if uid:
                data = recomm.get_recommendations(uid, 10)
            elif cat:
                data = db.get_resources_by_category(cat, 10)
            else:
                data = db.get_popular_resources(10)
            return self._send_json(data, many=True)

        if path == '/api/preferences':
            uid = self._get_user_id()
            if not uid:
                return self._respond({'error': 'Unauthorized'}, code=401)
            prefs = db.get_user_preferences(uid)
            return self._send_json(prefs)

        if path == '/api/admin/users':
            if not self._is_admin():
                return self._respond({'error': 'Forbidden'}, code=403)
            return self._send_json(adm.list_users(), many=True)

        if path == '/api/admin/sources':
            if not self._is_admin():
                return self._respond({'error': 'Forbidden'}, code=403)
            return self._send_json(adm.list_sources(), many=True)

        if path == '/rss':
            uid = self._get_user_id()
            cat = params.get('category', [None])[0]
            xml = rss_gen.generate_feed(category=cat, user_id=uid)
            self.send_response(200)
            self.send_header('Content-Type', 'application/rss+xml')
            self.end_headers()
            self.wfile.write(xml.encode('utf-8'))
            return

        # static fallback
        fp = FE_ROOT + (path if path != '/' else '/index.html')
        if os.path.isfile(fp):
            return self._serve_file(fp)

        self.send_response(404)
        self.end_headers()


    # ───────────────────────────── POST ──────────────────────────────────
    def do_POST(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body   = self.rfile.read(length)
        data   = json.loads(body) if body else {}

        if path == '/api/register':
            # 1) Inregistrare user
            ok, msg = auth.register(
                data.get('username', ''),
                data.get('password', ''),
                data.get('email', '')
            )

            if ok and data.get('admin_code') == auth.admin_code:
                print("→ [DEBUG] Promoting", data['username'], "to admin")
                new_user = db.get_user_by_username(data['username'])
                db.update_user(new_user['id'], is_admin=1)
                print("→ [DEBUG] After promotion, is_admin =", db.get_user_by_username(data['username'])['is_admin'])

            # 3) Raspuns catre client
            return self._respond({'success': ok, 'message': msg})

        if path == '/api/login':
            ok, sid, msg = auth.login(
                data.get('username', ''), data.get('password', '')
            )
            cookie = auth.create_signed_cookie(sid) if ok else None
            return self._respond({'success': ok, 'message': msg}, set_cookie=cookie)

        if path == '/api/logout':
            sid = self._get_session_id()
            if sid:
                auth.logout(sid)
            return self._respond({'success': True}, expire_cookie=True)

        # create new source
        if path == '/api/admin/sources':
            if not self._is_admin():
                return self._respond({'error': 'Forbidden'}, code=403)
            sid = adm.add_source(data.get('category'), data.get('url'))
            return self._respond({'success': bool(sid)})

        self.send_response(404)
        self.end_headers()



    # ───────────────────────────── PUT ───────────────────────────────────
    def do_PUT(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        print("→ [DEBUG PUT] path =", repr(path))
        length = int(self.headers.get('Content-Length', 0))
        body   = self.rfile.read(length)
        data   = json.loads(body) if body else {}

        # update user preferences
        if path == '/api/preferences':
            uid = self._get_user_id()
            if not uid:
                return self._respond({'error': 'Unauthorized'}, code=401)
            db.set_user_preferences(uid, data.get('categories', []))
            return self._respond({'success': True})

        # update a source (not yet implemented in AdminManager)
        if path.startswith('/api/admin/sources/'):
            if not self._is_admin():
                return self._respond({'error': 'Forbidden'}, code=403)
            source_id = int(path.rsplit('/', 1)[1])
            # Example: adm.update_source(source_id, data['category'], data['url'])
            return self._respond({'success': False, 'message': 'Not implemented'})

        self.send_response(404)
        self.end_headers()


    # ───────────────────────────── DELETE ────────────────────────────────
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path   = parsed.path

        # delete a source
        if path.startswith('/api/admin/sources/'):
            if not self._is_admin():
                return self._respond({'error': 'Forbidden'}, code=403)
            source_id = int(path.rsplit('/', 1)[1])
            adm.delete_source(source_id)
            return self._respond({'success': True})

        self.send_response(404)
        self.end_headers()


    # ───────────────────────────── HELPERS ──────────────────────────────
    def _get_session_id(self):
        raw = self.headers.get('Cookie')
        print("→ [DEBUG] Raw Cookie header:", raw)
        if not raw:
            return None
        cookie = auth.parse_cookie(raw).get('session')
        sid = None
        if cookie:
            sid = auth.validate_signed_cookie(cookie.value)
        print("→ [DEBUG] Parsed session_id:", sid)
        return sid

    def _get_user_id(self):
        sid = self._get_session_id()
        return auth.validate_session(sid) if sid else None

    def _is_admin(self):
        sid = self._get_session_id()
        uid = auth.validate_session(sid) if sid else None
        print(f"→ [DEBUG] Session '{sid}' ⇒ user_id:", uid)
        user = db.get_user_by_id(uid) if uid else None
        print(f"→ [DEBUG] Loaded user from DB:", dict(user) if user else None)
        is_admin = bool(user and user['is_admin'])
        print("→ [DEBUG] is_admin flag:", is_admin)
        return is_admin

    def _send_json(self, data, many=False, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        payload = [dict(r) for r in data] if many else data
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def _respond(self, payload, set_cookie=None, expire_cookie=False, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        if expire_cookie:
            self.send_header('Set-Cookie', 'session=; Path=/; HttpOnly; Max-Age=0')
        elif set_cookie is not None:
            self.send_header(
                'Set-Cookie',
                f'session={set_cookie}; Path=/; HttpOnly; Max-Age={auth.session_duration}'
            )
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def _serve_file(self, path):
        self.send_response(200)
        ctype, _ = mimetypes.guess_type(path)
        self.send_header('Content-Type', ctype or 'application/octet-stream')
        self.end_headers()
        with open(path, 'rb') as f:
            self.wfile.write(f.read())


if __name__ == '__main__':
    print("Starting server at http://0.0.0.0:8000")
    HTTPServer(('0.0.0.0', 8000), RequestHandler).serve_forever()
