from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory user store for demonstration purposes
users = {}

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    if email in users:
        return jsonify({'error': 'User already exists'}), 400

    users[email] = {'password': password}
    return jsonify({'message': 'User registered successfully'}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    userType = data.get('userType')

    if not email or not password or not userType:
        return jsonify({'error': 'Email, password, and userType are required'}), 400

    user = users.get(email)
    if not user or user['password'] != password:
        return jsonify({'error': 'Invalid email or password'}), 401

    # For demonstration, just return success message
    return jsonify({'message': f'Logged in as {userType}'}), 200

if __name__ == '__main__':
    app.run(debug=True)
