import os, time, json, hmac, hashlib
from http import cookies
from typing import Optional

class AuthManager:
    def __init__(self, db_manager, config_path=None):
        cfg_file = config_path or os.getenv('CONFIG_PATH', 'config.json')
        cfg = json.load(open(cfg_file, 'r'))
        self.session_duration = cfg.get('session_duration', 86400)
        self.admin_code = cfg.get('admin_code')

        # Cheie secretă persistentă
        key_hex = cfg.get('secret_key_hex', '')
        if key_hex:
            self.secret_key = bytes.fromhex(key_hex)
        else:
            self.secret_key = os.urandom(32)
            cfg['secret_key_hex'] = self.secret_key.hex()
            with open(cfg_file, 'w') as f:
                json.dump(cfg, f, indent=2)

        self.db = db_manager
        # TODO: încărcați sesiuni dintr-un tabel DB în loc de memorie
        self.active_sessions = {}

    # PASSWORD HASHING
    def hash_password(self, password):
        salt = os.urandom(16)
        h = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
        return salt.hex() + ':' + h.hex()

    def verify_password(self, stored, provided):
        salt_hex, hash_hex = stored.split(':', 1)
        salt, stored_hash = bytes.fromhex(salt_hex), bytes.fromhex(hash_hex)
        new_hash = hashlib.pbkdf2_hmac('sha256', provided.encode('utf-8'), salt, 100_000)
        return hmac.compare_digest(stored_hash, new_hash)

    # REGISTER & LOGIN
    def register(self, username, password, email):
        if self.db.get_user_by_username(username):
            return False, 'Username deja folosit'
        if self.db.get_user_by_email(email):
            return False, 'Email deja folosit'
        pwd_hash = self.hash_password(password)
        uid = self.db.add_user(username, pwd_hash, email)
        return (True, 'Înregistrare reușită') if uid else (False, 'DB error')

    def login(self, username, password):
        user = self.db.get_user_by_username(username)
        if not user or not self.verify_password(user['password_hash'], password):
            return False, None, 'Credentiale invalide'
        session_id = os.urandom(16).hex()
        expiry = int(time.time()) + self.session_duration
        self.active_sessions[session_id] = {'user_id': user['id'], 'expiry': expiry}
        # TODO: persistare sesiune în DB
        return True, session_id, 'Autentificare reușită'

    # COOKIE SIGNING
    def create_signed_cookie(self, session_id):
        sig = hmac.new(self.secret_key, session_id.encode('utf-8'), 'sha256').hexdigest()
        return f"{session_id}.{sig}"

    def validate_signed_cookie(self, cookie_val) -> Optional[str]:
        try:
            sid, sig = cookie_val.split('.', 1)
            expected = hmac.new(self.secret_key, sid.encode('utf-8'), 'sha256').hexdigest()
            if hmac.compare_digest(sig, expected):
                return sid
        except:
            pass
        return None

    # SESSION VALIDATION & LOGOUT
    def validate_session(self, session_id) -> Optional[int]:
        sess = self.active_sessions.get(session_id)
        if not sess or sess['expiry'] < time.time():
            self.active_sessions.pop(session_id, None)
            return None
        return sess['user_id']

    def logout(self, session_id):
        self.active_sessions.pop(session_id, None)

    # COOKIE PARSING
    def parse_cookie(self, header):
        c = cookies.SimpleCookie()
        c.load(header or "")
        return c
