import sqlite3
import json

def migrate_categories():
    conn = sqlite3.connect('bis_prototype.db')
    cursor = conn.cursor()
    
    # Check if category column exists, if categories exists
    cursor.execute("PRAGMA table_info(documents)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if "categories" not in columns:
        print("Adding categories column...")
        cursor.execute("ALTER TABLE documents ADD COLUMN categories JSON")
        
    if "category" in columns:
        print("Migrating data from category to categories...")
        cursor.execute("SELECT id, category FROM documents")
        rows = cursor.fetchall()
        for row in rows:
            doc_id = row[0]
            cat_str = row[1]
            cat_list = [cat_str] if cat_str and cat_str != "General" else ["General"]
            cat_json = json.dumps(cat_list)
            cursor.execute("UPDATE documents SET categories = ? WHERE id = ?", (cat_json, doc_id))
            
        print("Dropping old category column...")
        try:
            cursor.execute("ALTER TABLE documents DROP COLUMN category")
        except sqlite3.OperationalError as e:
            print(f"Could not drop column (might be older sqlite version): {e}")
            
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate_categories()
