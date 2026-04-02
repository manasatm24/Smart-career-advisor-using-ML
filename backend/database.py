import os
import sqlite3
from flask_sqlalchemy import SQLAlchemy

# --- Database path setup ---
BASE_DIR = os.path.dirname(__file__)
DB_DIR = os.path.join(BASE_DIR, "database")
DB_PATH = os.path.join(DB_DIR, "career_advisor.db")

db=SQLAlchemy()

def connect_db():
    # Create folder if not exists
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    return conn

def create_tables():
    conn = connect_db()
    cursor = conn.cursor()

    # --- Admin Table ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    # --- Job Listings Table ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT,
            description TEXT,
            skills TEXT
        )
    """)

    # --- Feedback Table ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT,
            email TEXT,       
            comments TEXT,
            rating INTEGER
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Tables created successfully at:", DB_PATH)

def seed_admin():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR IGNORE INTO admin (username, password)
        VALUES (?, ?)
    """, ("admin", "1234"))
    conn.commit()
    conn.close()
    print("✅ Default admin added (username=admin, password=1234)")

# 🚀 Run only when executed directly
if __name__ == "__main__":
    create_tables()
    seed_admin()