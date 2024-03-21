from flask import Flask, request, jsonify
import subprocess
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/send_sms', methods=['POST'])
def send_sms():
    if request.method == 'POST':
        data = request.get_json()
        message = data.get('message')
        if message:
            try:
                # Call the send_sms function from sms.py and pass the message
                subprocess.run(['python', 'sms.py', message])
                return jsonify({'message': 'SMS sent successfully'}), 200
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({'error': 'Message is required'}), 400
    else:
        return jsonify({'error': 'Method not allowed'}), 405

if __name__ == '__main__':
    app.run(debug=True, port = 5000)







