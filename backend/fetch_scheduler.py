import time
from backend.db_manager import DatabaseManager
from backend.resource_fetcher import ResourceFetcher

db  = DatabaseManager()
fch = ResourceFetcher(db)
while True:
    print("Fetch resources…")
    fch.fetch_resources()  # preia toate categoriile
    time.sleep(3600)       # la fiecare ora
