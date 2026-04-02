# Smart Career Advisor ML

A machine learning-powered career guidance platform that helps students and professionals discover suitable career paths and job opportunities based on their academic background, skills, and preferences.

##  Features

- **Intelligent Career Matching**: Uses ML algorithms to suggest career paths based on branch, skills, and experience level
- **Job Market Insights**: Real-time job listings with detailed requirements and salary information
- **User Feedback System**: Collect and manage user feedback for continuous improvement
- **Responsive Web Interface**: Modern, mobile-friendly UI built with HTML, CSS, and JavaScript
- **RESTful API**: Backend API for seamless integration and data management

## Tech Stack

### Backend
- **Python** - Core programming language
- **Flask** - Web framework for API development
- **SQLAlchemy** - ORM for database management
- **Flask-Migrate** - Database migration tool
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Markup language
- **CSS3** - Styling and animations
- **JavaScript** - Client-side interactivity
- **Font Awesome** - Icons and UI elements

### Database
- **SQLite** - Lightweight database for development
- **SQLAlchemy Models** - Career, Job, Feedback, Admin, Student tables

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

##  Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-career-advisor-ml.git
   cd smart-career-advisor-ml
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   # On Windows
   .venv\Scripts\activate
   # On macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install flask flask-sqlalchemy flask-migrate flask-cors
   ```

4. **Set up the database**
   ```bash
   cd backend
   python app.py
   ```
   This will create the SQLite database and tables automatically.

##  Usage

1. **Start the backend server**
   ```bash
   cd backend
   python app.py
   ```
   The server will run on `http://localhost:5000`

2. **Open the frontend**
   - Navigate to the `smart-career-advisor/smart-c-advisor/` directory
   - Open `index.html` in your web browser
   - Or serve it using a local server for better experience

3. **Access the admin panel**
   - Visit `http://localhost:5000/admin` in your browser
   - Default admin credentials: (configure in `reset_admin.py`)

##  Project Structure

```
smart-career-advisor-ml/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── database.py            # Database configuration
│   ├── admin_routes.py        # Admin API endpoints
│   ├── student_routes.py      # Student API endpoints
│   ├── career_routes.py       # Career API endpoints
│   ├── job_routes.py          # Job API endpoints
│   ├── feedback_routes.py     # Feedback API endpoints
│   ├── reset_admin.py         # Admin setup script
│   └── database/
│       └── instance/          # SQLite database files
├── smart-career-advisor/
│         ├── index.html         # Main web page
│         ├── style.css          # Main styles
│         ├── script.js          # Main JavaScript
│         └── data/
│           ├── careers.json   # Career data
│           └── jobs.json      # Job listings
└── README.md                  # Project documentation
```

##  API Endpoints

### Student Routes (`/student`)
- `POST /student/career` - Get career recommendations
- `GET /student/jobs` - Get job listings

### General API (`/api`)
- `GET /api/careers` - List all careers
- `POST /api/feedback` - Submit feedback
- `GET /api/jobs` - Get all jobs

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue on GitHub.

---

**Made with  for career guidance and professional development**
