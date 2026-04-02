from flask import Blueprint, request, jsonify
import requests
from database import connect_db

job_bp = Blueprint("job_bp", __name__)

# ---------------------------------------
# 🔹 1. Get Live Jobs from RapidAPI (Public)
# ---------------------------------------
@job_bp.route("/jobs/live", methods=["POST"])
def get_live_jobs():
    data = request.get_json()
    skill = data.get("skill")
    location = data.get("location")

    if not skill or not location:
        return jsonify({"error": "Please provide both skill and location"}), 400

    url = f"https://jsearch.p.rapidapi.com/search?query={skill}+jobs+in+{location}"
    headers = {
        "x-rapidapi-key": "3850afda6fmshcb40cbaff1e73d9p16afc8jsnde9f263be6ac",
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        job_data = response.json()

        jobs = []
        for job in job_data.get("data", []):
            jobs.append({
                "title": job.get("job_title"),
                "company": job.get("employer_name"),
                "location": job.get("job_city"),
                "url": job.get("job_apply_link")
            })

        return jsonify(jobs), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch jobs: {str(e)}"}), 500


# ---------------------------------------
# 🔹 2. Get Local Jobs from SQLite Database
# ---------------------------------------
@job_bp.route("/jobs/local", methods=["GET"])
def get_local_jobs():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, company, description, skills FROM job_listings ORDER BY id DESC")
    jobs = cursor.fetchall()
    conn.close()

    job_list = []
    for job in jobs:
        job_list.append({
            "id": job[0],
            "title": job[1],
            "company": job[2],
            "description": job[3],
            "skills": job[4]
        })
    return jsonify(job_list), 200


# ---------------------------------------
# 🔹 3. Admin - Add New Job Manually
# ---------------------------------------
@job_bp.route("/admin/add_job", methods=["POST"])
def add_job():
    data = request.get_json()
    title = data.get("title")
    company = data.get("company")
    description = data.get("description")
    skills = data.get("skills")

    if not title or not company:
        return jsonify({"error": "Missing title or company"}), 400

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO job_listings (title, company, description, skills) VALUES (?, ?, ?, ?)",
                   (title, company, description, skills))
    conn.commit()
    conn.close()
    return jsonify({"message": "✅ Job added successfully!"}),