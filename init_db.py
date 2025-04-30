import sqlite3, os

os.makedirs('data', exist_ok=True)

# Conectam/cream baza de date
conn = sqlite3.connect('data/resources.db')
with open('schema.sql', 'r') as f:
    conn.executescript(f.read())
conn.close()
print("Schema aplicata cu succes in data/resources.db")
