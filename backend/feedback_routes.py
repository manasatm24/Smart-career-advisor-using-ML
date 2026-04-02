from flask import Blueprint, request, jsonify
from database import connect_db

feedback_bp = Blueprint('feedback_bp', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
def add_feedback():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        if not name or not email or not message:
            return jsonify({'error': 'All fields are required'}), 400

        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO feedback (user_name, email, comments, rating)
            VALUES (?, ?, ?, ?)
        """, (name, email, message, 5))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Feedback submitted successfully!'}), 201

    except Exception as e:
        print("❌ Error in add_feedback:", str(e))
        return jsonify({'error': str(e)}), 500