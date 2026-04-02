from flask import Blueprint, jsonify, request
from models import Job, Career

student_bp = Blueprint('student_bp', __name__)

# Get career suggestions
@student_bp.route('/careers', methods=['GET'])
def get_careers():
    careers = Career.query.all()
    result = [{"id": c.id, "branch": c.branch, "career": c.career, "skills": c.skills} for c in careers]
    return jsonify(result)

# Get job recommendations
@student_bp.route('/jobs', methods=['POST'])
def recommend_jobs():
    data = request.get_json()
    skills = data.get('skills', [])
    results = []
    jobs = Job.query.all()
    for job in jobs:
        job_skills = job.skills.split(',')
        if any(skill in job_skills for skill in skills):
            results.append({
                "company": job.company,
                "role": job.role,
                "location": job.location,
                "vacancies": job.vacancies
            })
    return jsonify(results)
