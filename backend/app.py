from flask import Flask
from flask_cors import CORS
from models import db
from admin_routes import admin_bp
from student_routes import student_bp
from feedback_routes import feedback_bp
from flask_migrate import Migrate
from job_routes import job_bp
from career_routes import career_bp


app = Flask(__name__)
CORS(app)

# Configure database
import os
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'career_advisor.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

# Register routes
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(student_bp, url_prefix='/student')
app.register_blueprint(feedback_bp, url_prefix='/api')

app.register_blueprint(job_bp, url_prefix='/api')
app.register_blueprint(career_bp, url_prefix='/api')

@app.route('/')
def home():
    return "Smart Career Advisor Backend Running!"

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # ✅ Creates all tables automatically
    app.run(debug=True)







