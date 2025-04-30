import sqlite3
import json
import os

class DatabaseManager:
    """
    DatabaseManager handles all database operations using SQLite.

    Responsibilities:
      - Initialize connection and load SQL schema
      - CRUD for users, resources, sources, and preferences
      - Export/import for CSV and JSON
    """

    def __init__(self, config_path=None):
        """
        Initialize database connection and ensure the schema is applied.

        Args:
            config_path (str): Path to JSON config with 'db_path'.
        """
        # Load configuration
        config_path = config_path or os.getenv('CONFIG_PATH', 'config.json')
        cfg = json.load(open(config_path, 'r'))
        db_file = cfg['db_path']
        os.makedirs(os.path.dirname(db_file), exist_ok=True)

        # Connect to SQLite database
        self.conn = sqlite3.connect(db_file, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()

        # Apply schema
        base = os.path.dirname(__file__)
        schema_path = os.path.join(base, '..', 'schema.sql')
        with open(schema_path, 'r') as f:
            self.cursor.executescript(f.read())
        self.conn.commit()

    # ------------------------------------------------------------------------
    # Users CRUD
    # ------------------------------------------------------------------------
    def add_user(self, username, password_hash, email):
        """Create a new user. Returns new user ID."""
        sql = "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)"
        self.cursor.execute(sql, (username, password_hash, email))
        self.conn.commit()
        return self.cursor.lastrowid

    def get_user_by_username(self, username):
        """Retrieve a user row by username."""
        self.cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        return self.cursor.fetchone()

    def get_user_by_id(self, user_id):
        """Retrieve a user row by ID."""
        self.cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        return self.cursor.fetchone()

    def get_user_by_email(self, email):
        """Retrieve a user row by email."""
        self.cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        return self.cursor.fetchone()

    def update_user(self, user_id, **fields):
        """Update user fields by user_id."""
        cols = ', '.join(f"{k} = ?" for k in fields)
        vals = list(fields.values()) + [user_id]
        self.cursor.execute(f"UPDATE users SET {cols} WHERE id = ?", vals)
        self.conn.commit()

    def delete_user(self, user_id):
        """Remove a user by ID."""
        self.cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        self.conn.commit()

    # ------------------------------------------------------------------------
    # Resources CRUD and Deduplication
    # ------------------------------------------------------------------------
    def resource_exists(self, url):
        """Check if a resource URL already exists."""
        self.cursor.execute("SELECT 1 FROM resources WHERE url = ?", (url,))
        return self.cursor.fetchone() is not None

    def add_resource(self, title, url, description=None,
                     category=None, source=None,
                     image_url=None, content_type=None):
        """
        Insert a new resource if not duplicate.
        Returns new resource ID or None if URL exists.
        """
        if self.resource_exists(url):
            return None
        sql = (
            "INSERT INTO resources"
            " (title, url, description, category, source, image_url, content_type)"
            " VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        self.cursor.execute(sql, (
            title, url, description, category, source, image_url, content_type
        ))
        self.conn.commit()
        return self.cursor.lastrowid

    def get_resource_by_id(self, resource_id):
        """Retrieve a resource by its ID."""
        self.cursor.execute("SELECT * FROM resources WHERE id = ?", (resource_id,))
        return self.cursor.fetchone()

    def get_resources_by_category(self, category, limit=10):
        """List resources in a category, most recent first."""
        self.cursor.execute(
            "SELECT * FROM resources WHERE category = ?"
            " ORDER BY created_at DESC LIMIT ?",
            (category, limit)
        )
        return self.cursor.fetchall()

    def get_popular_resources(self, limit=10):
        """List recent resources across all categories."""
        self.cursor.execute(
            "SELECT * FROM resources ORDER BY created_at DESC LIMIT ?",
            (limit,)
        )
        return self.cursor.fetchall()

    def update_resource(self, resource_id, **fields):
        """Update resource fields by resource_id."""
        cols = ', '.join(f"{k} = ?" for k in fields)
        vals = list(fields.values()) + [resource_id]
        self.cursor.execute(f"UPDATE resources SET {cols} WHERE id = ?", vals)
        self.conn.commit()

    def delete_resource(self, resource_id):
        """Remove a resource by ID."""
        self.cursor.execute("DELETE FROM resources WHERE id = ?", (resource_id,))
        self.conn.commit()

    # ------------------------------------------------------------------------
    # User Preferences
    # ------------------------------------------------------------------------
    def get_user_preferences(self, user_id):
        """Retrieve categories the user prefers."""
        self.cursor.execute(
            "SELECT category FROM user_preferences WHERE user_id = ?",
            (user_id,)
        )
        return [row['category'] for row in self.cursor.fetchall()]

    def set_user_preferences(self, user_id, categories):
        """Replace all preferences for a user."""
        self.cursor.execute(
            "DELETE FROM user_preferences WHERE user_id = ?",
            (user_id,)
        )
        for cat in categories:
            self.cursor.execute(
                "INSERT INTO user_preferences (user_id, category) VALUES (?, ?)",
                (user_id, cat)
            )
        self.conn.commit()

    def add_user_preference(self, user_id, category):
        """Helper: add one preference for testing."""
        try:
            self.cursor.execute(
                "INSERT INTO user_preferences (user_id, category) VALUES (?, ?)",
                (user_id, category)
            )
            self.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False

    # ------------------------------------------------------------------------
    # Sources CRUD
    # ------------------------------------------------------------------------
    def add_source(self, category, url):
        """Add a new content source URL under a category."""
        sql = "INSERT OR IGNORE INTO sources (category, url) VALUES (?, ?)"
        self.cursor.execute(sql, (category, url))
        self.conn.commit()
        return self.cursor.lastrowid

    def list_sources(self):
        """List all sources with categories."""
        self.cursor.execute("SELECT * FROM sources ORDER BY category, url")
        return self.cursor.fetchall()

    def delete_source(self, source_id):
        """Remove a source entry by ID."""
        self.cursor.execute("DELETE FROM sources WHERE id = ?", (source_id,))
        self.conn.commit()

    def get_sources_by_category(self, category):
        """Retrieve source URLs for a category."""
        self.cursor.execute(
            "SELECT url FROM sources WHERE category = ?", (category,)
        )
        return [row['url'] for row in self.cursor.fetchall()]

    # ------------------------------------------------------------------------
    # Export / Import
    # ------------------------------------------------------------------------
    def get_all_users(self):
        """Return all users for export (CSV/JSON)."""
        self.cursor.execute(
            "SELECT id, username, email, registration_date, is_admin FROM users"
        )
        return self.cursor.fetchall()

    def get_all_resources(self):
        """Return all resources for export (CSV/JSON)."""
        self.cursor.execute("SELECT * FROM resources")
        return self.cursor.fetchall()

    def get_all_preferences(self):
        """Return all user preferences for export (CSV/JSON)."""
        self.cursor.execute("SELECT user_id, category FROM user_preferences")
        return self.cursor.fetchall()

    # ------------------------------------------------------------------------
    # Close connection
    # ------------------------------------------------------------------------
    def close(self):
        """Close the database connection."""
        self.conn.close()
