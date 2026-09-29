import sqlite3
import json

conn = sqlite3.connect('bis_prototype.db')
cursor = conn.cursor()
cursor.execute('SELECT embedding FROM document_chunks WHERE embedding IS NOT NULL LIMIT 5')
rows = cursor.fetchall()

print(f"Total rows fetched: {len(rows)}")

prev = None
for i, row in enumerate(rows):
    emb = row[0]
    parsed = json.loads(emb)
    print(f"Row {i} - Parsed Length: {len(parsed)}")
    is_zero = all(x == 0 for x in parsed)
    print(f"Row {i} - Is All Zero: {is_zero}")
    if prev is not None:
        print(f"Row {i} - Same as previous: {parsed == prev}")
    prev = parsed
