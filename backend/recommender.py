import time

class Recommender:
    def __init__(self, db_manager):
        self.db = db_manager
        self.cache = {}  # {(user_id, limit): (timestamp, data)}

    def get_recommendations(self, user_id=None, limit=10):
        key = (user_id, limit)
        now = time.time()
        if key in self.cache and now - self.cache[key][0] < 300:
            return self.cache[key][1]

        if user_id:
            prefs = self.db.get_user_preferences(user_id)
            resources = []
            for cat in prefs:
                resources += self.db.get_resources_by_category(cat, limit)
            # scoring simplu: cele mai recente
            resources = sorted(resources, key=lambda r: r['created_at'], reverse=True)
        else:
            resources = self.db.get_popular_resources(limit)

        result = resources[:limit]
        self.cache[key] = (now, result)
        return result
