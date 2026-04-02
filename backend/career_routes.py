from flask import Blueprint, jsonify
import json
import os

career_bp = Blueprint('career_bp', __name__)

# Path to your career JSON file
base_dir = os.path.abspath(os.path.dirname(__file__))
career_file = os.path.join(base_dir, 'career_data.json')

@career_bp.route('/career', methods=['GET'])
def get_career_data():
    try:
        with open(career_file, 'r') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)})
