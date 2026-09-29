import sys
import os

# Add the parent directory to sys.path so we can import 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.database import engine
from app.models import Base

def init_db():
    print("Creating database tables...")
    try:
        # Create all tables stored in the metadata of Base
        Base.metadata.create_all(bind=engine)
        print("Successfully created database tables.")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    init_db()
