from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# 🧩 Admin table — to manage backend
class Admin(db.Model):
    __table_args__ = {'extend_existing': True}  # ✅ Add this line
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# 🧩 Career table — stores all available career paths
class Career(db.Model):
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    branch = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    required_skills = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, nullable=True)

# 🧩 Job table — stores job openings
class Job(db.Model):
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    eligibility = db.Column(db.String(200))
    salary = db.Column(db.String(100))
    posted_on = db.Column(db.DateTime, default=datetime.utcnow)

# 🧩 Feedback table — stores user messages
class Feedback(db.Model):
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    date_submitted = db.Column(db.DateTime, default=datetime.utcnow)

# 🧩 Student table — stores user selections
class Admin(db.Model):
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    token = db.Column(db.String(100), nullable=True)
