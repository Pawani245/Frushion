from flask import Flask, request, jsonify
from io import BytesIO
import base64
from PIL import Image

app = Flask(__name__)

@app.route('/api/score', methods=['POST'])
def score():
    try:
        # Ensure the request contains JSON data
        if request.content_type != 'application/json':
            return jsonify({'error': 'Expected Content-Type: application/json'}), 415

        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        # Decode the base64-encoded image
        image_data = data['image']
        image_str = image_data.split(',')[1]  # Strip off the data URL prefix
        image_bytes = base64.b64decode(image_str)
        image = Image.open(BytesIO(image_bytes))

        # Analyze the image and calculate the score
        score = 8  # Replace this with your actual scoring logic

        return jsonify({'score': score})

    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
