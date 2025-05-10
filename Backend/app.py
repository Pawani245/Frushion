from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

GOLDEN_RATIO = 1.618

# Function to validate landmarks
def validate_landmarks(landmarks):
    """
    Validate that landmarks are in the correct format.
    """
    if not isinstance(landmarks, list) or len(landmarks) < 5:
        return False, "Landmarks should be a list of at least 5 points."
    
    for point in landmarks:
        if not isinstance(point, list) or len(point) != 2:
            return False, "Each landmark should be a list of two numerical values [x, y]."
        if not all(isinstance(coord, (int, float)) for coord in point):
            return False, "Each coordinate [x, y] should be a number."
    
    return True, None

# Function to calculate beauty score based on Golden Ratio
def analyze_image_for_beauty(landmarks: list) -> float:
    """
    Analyze facial landmarks using the Golden Ratio for beauty scoring.
    """
    try:
        # Extracting landmarks
        left_eye = landmarks[0]
        right_eye = landmarks[1]
        nose = landmarks[2]
        mouth_left = landmarks[3]
        mouth_right = landmarks[4]

        # Calculate distances
        eye_distance = np.linalg.norm(np.array(left_eye) - np.array(right_eye))
        nose_to_eye_distance = np.linalg.norm(np.array(nose) - np.array(left_eye))
        mouth_to_nose_distance = np.linalg.norm(np.array(mouth_left) - np.array(nose))

        # Calculate Golden Ratio-based score
        ratio_1 = eye_distance / nose_to_eye_distance
        ratio_2 = mouth_to_nose_distance / nose_to_eye_distance

        # Beauty score
        beauty_score = (abs(ratio_1 - GOLDEN_RATIO) + abs(ratio_2 - GOLDEN_RATIO)) * 50
        beauty_score = max(min(beauty_score, 100), 0)  # Ensure score is between 0 and 100
        return round(beauty_score, 2)

    except Exception as e:
        print(f"Error in analyzing image: {e}")
        return 0  # Return a default score if something goes wrong

@app.route('/api/score', methods=['POST'])
def get_beauty_score():
    data = request.get_json()

    if 'landmarks' not in data:
        return jsonify({'error': 'Facial landmarks not provided'}), 400

    landmarks = data['landmarks']

    # Validate landmarks
    is_valid, error_message = validate_landmarks(landmarks)
    if not is_valid:
        return jsonify({'error': error_message}), 400

    # Perform beauty score analysis
    score = analyze_image_for_beauty(landmarks)
    return jsonify({'score': f"{score}/100"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)