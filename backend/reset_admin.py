# reset_admin.py
# Run from the backend folder:  py reset_admin.py
# This ensures the admin table has a 'token' column and stores a HASHED password
# that works with check_password_hash() in your admin_routes.py.

import os
import sqlite3
from werkzeug.security import generate_password_hash

# --- paths ---
BASE_DIR = os.path.dirname(__file__)
DB_DIR = os.path.join(BASE_DIR, "database")
DB_PATH = os.path.join(DB_DIR, "career_advisor.db")

os.makedirs(DB_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# 1) Make sure admin table exists (minimal)
cur.execute("""
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
""")

# 2) Ensure 'token' column exists (admin_routes.py sets admin.token = token)
cur.execute("PRAGMA table_info(admin)")
cols = [row[1] for row in cur.fetchall()]
if "token" not in cols:
    cur.execute("ALTER TABLE admin ADD COLUMN token TEXT")
    print("ℹ  Added 'token' column to admin table.")

# 3) Upsert admin with HASHED password (use admin / admin123 to login)
hashed = generate_password_hash("admin123")

cur.execute("SELECT id FROM admin WHERE username = ?", ("admin",))
row = cur.fetchone()

if row:
    cur.execute(
        "UPDATE admin SET password = ?, token = NULL WHERE username = ?",
        (hashed, "admin")
    )
    print("✅ Reset admin password to 'admin123' and cleared token.")
else:
    cur.execute(
        "INSERT INTO admin (username, password, token) VALUES (?, ?, NULL)",
        ("admin", hashed)
    )
    print("✅ Created admin user with password 'admin123'.")

conn.commit()
conn.close()
print("✅ Done. Now start the backend and login with: admin / admin123")
