import csv
import json
import os
from datetime import datetime

class AdminManager:
    def __init__(self, db_manager):
        self.db = db_manager
    
    def get_system_stats(self):
        """Returnează statistici despre sistemul ReT"""
        stats = {
            'total_users':      self._count_users(),
            'total_resources':  self._count_resources(),
            'resources_by_category': self._get_resources_by_category(),
            'popular_categories':    self._get_popular_categories(),
            'recent_resources':      self._get_recent_resources(5),
        }
        return stats
    
    def export_data(self, format_type, target_file, data_type):
        """
        Exportă date în formatele CSV sau JSON
        
        Args:
            format_type: 'csv' sau 'json'
            target_file: calea către fișierul de ieșire
            data_type: 'users', 'resources' sau 'preferences'
        
        Returns:
            bool: succes sau eșec
        """
        # selectează colecția de exportat
        if data_type == 'users':
            data = self.db.get_all_users()
        elif data_type == 'resources':
            data = self.db.get_all_resources()
        elif data_type == 'preferences':
            data = self.db.get_all_preferences()
        else:
            return False
        
        # asigură directorul
        os.makedirs(os.path.dirname(target_file), exist_ok=True)
        
        # scrie în formatul cerut
        if format_type == 'csv':
            return self._export_to_csv(data, target_file)
        elif format_type == 'json':
            return self._export_to_json(data, target_file)
        else:
            return False
    
    def import_data(self, format_type, source_file, data_type):
        """
        Importă date din CSV sau JSON
        
        Args:
            format_type: 'csv' sau 'json'
            source_file: calea către fișierul sursă
            data_type: 'users', 'resources' sau 'preferences'
        
        Returns:
            dict: statistici despre import
        """
        if not os.path.exists(source_file):
            return {'success': False, 'message': 'File not found'}
        
        # încarcă datele din fișier
        if format_type == 'csv':
            data = self._import_from_csv(source_file)
        elif format_type == 'json':
            data = self._import_from_json(source_file)
        else:
            return {'success': False, 'message': 'Unsupported format'}
        
        stats = {'total': len(data), 'added': 0, 'errors': 0}
        
        if data_type == 'users':
            for item in data:
                try:
                    uid = self.db.add_user(
                        item.get('username'),
                        item.get('password_hash'),
                        item.get('email')
                    )
                    if uid:
                        # setează flag-ul admin dacă există
                        if item.get('is_admin'):
                            self.db.update_user(uid, is_admin=1)
                        stats['added'] += 1
                    else:
                        stats['errors'] += 1
                except Exception:
                    stats['errors'] += 1
        
        elif data_type == 'resources':
            for item in data:
                try:
                    rid = self.db.add_resource(
                        item.get('title'),
                        item.get('url'),
                        item.get('description'),
                        item.get('category'),
                        item.get('source'),
                        item.get('image_url'),
                        item.get('content_type')
                    )
                    if rid:
                        stats['added'] += 1
                    else:
                        stats['errors'] += 1
                except Exception:
                    stats['errors'] += 1
        
        elif data_type == 'preferences':
            for item in data:
                try:
                    # fiecare item trebuie să conțină 'user_id' și 'category'
                    ok = self.db.add_user_preference(
                        item.get('user_id'),
                        item.get('category')
                    )
                    if ok:
                        stats['added'] += 1
                    else:
                        stats['errors'] += 1
                except Exception:
                    stats['errors'] += 1
        
        else:
            return {'success': False, 'message': 'Unsupported data_type'}
        
        stats['success'] = (stats['errors'] == 0)
        return stats
    
    # -- COUNT / STATS HELPERS --------------------------------------------
    def _count_users(self):
        self.db.cursor.execute("SELECT COUNT(*) AS count FROM users")
        row = self.db.cursor.fetchone()
        return row['count'] if row else 0

    def _count_resources(self):
        self.db.cursor.execute("SELECT COUNT(*) AS count FROM resources")
        row = self.db.cursor.fetchone()
        return row['count'] if row else 0

    def _get_resources_by_category(self):
        self.db.cursor.execute("""
            SELECT category, COUNT(*) AS count
            FROM resources
            WHERE category IS NOT NULL
            GROUP BY category
        """)
        return {r['category']: r['count'] for r in self.db.cursor.fetchall()}

    def _get_popular_categories(self):
        self.db.cursor.execute("""
            SELECT category, COUNT(*) AS count
            FROM user_preferences
            GROUP BY category
            ORDER BY count DESC
        """)
        return [dict(r) for r in self.db.cursor.fetchall()]

    def _get_recent_resources(self, limit):
        self.db.cursor.execute("""
            SELECT * FROM resources
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
        return [dict(r) for r in self.db.cursor.fetchall()]
    
    # -- EXPORT HELPERS ---------------------------------------------------
    def _export_to_csv(self, data, target_file):
        if not data:
            return False
        try:
            with open(target_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=data[0].keys())
                writer.writeheader()
                for row in data:
                    writer.writerow(dict(row))
            return True
        except Exception as e:
            print(f"Eroare export CSV: {e}")
            return False

    def _export_to_json(self, data, target_file):
        try:
            with open(target_file, 'w', encoding='utf-8') as f:
                json.dump([dict(r) for r in data], f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Eroare export JSON: {e}")
            return False

    # -- IMPORT HELPERS ---------------------------------------------------
    def _import_from_csv(self, source_file):
        rows = []
        try:
            with open(source_file, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    rows.append(row)
        except Exception as e:
            print(f"Eroare import CSV: {e}")
        return rows

    def _import_from_json(self, source_file):
        try:
            with open(source_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Eroare import JSON: {e}")
            return []

    # -- SURSE ------------------------------------------------------------
    def list_sources(self):
        return self.db.list_sources()

    def add_source(self, category, url):
        return self.db.add_source(category, url)

    def delete_source(self, source_id):
        return self.db.delete_source(source_id)

    # -- UTILIZATORI ------------------------------------------------------
    def list_users(self):
        """Returnează toți utilizatorii (pentru modul admin)"""
        self.db.cursor.execute(
            "SELECT id, username, email, registration_date, is_admin FROM users"
        )
        return [dict(r) for r in self.db.cursor.fetchall()]
