from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

# Golden Ratio-related facial features (simplified)
GOLDEN_RATIO = 1.618

def analyze_image_for_beauty(landmarks: list) -> float:
    """
    Analyze facial landmarks using the Golden Ratio for beauty scoring.
    We'll use simplified distances between key facial points to compute the score.
    """
    try:
        # Assuming landmarks are in the form: [x, y] for each key point
        left_eye = landmarks[0]  # [x, y] coordinates
        right_eye = landmarks[1]
        nose = landmarks[2]
        mouth_left = landmarks[3]
        mouth_right = landmarks[4]

        # Calculate distances (Euclidean distance between points)
        eye_distance = np.linalg.norm(np.array(left_eye) - np.array(right_eye))
        nose_to_eye_distance = np.linalg.norm(np.array(nose) - np.array(left_eye))
        mouth_to_nose_distance = np.linalg.norm(np.array(mouth_left) - np.array(nose))

        # Calculate the Golden Ratio-based score
        ratio_1 = eye_distance / nose_to_eye_distance
        ratio_2 = mouth_to_nose_distance / nose_to_eye_distance

        # Compare these ratios with the Golden Ratio
        beauty_score = (abs(ratio_1 - GOLDEN_RATIO) + abs(ratio_2 - GOLDEN_RATIO)) * 50
        beauty_score = max(min(beauty_score, 100), 0)  # Ensure score is between 0 and 100
        return round(beauty_score, 2)

    except Exception as e:
        print(f"Error in analyzing image: {e}")
        return 0  # Return a default score if something goes wrong


def detect_face(landmarks: list) -> bool:
    """
    Check if facial landmarks are provided. This is a simple check to ensure we have valid landmarks.
    """
    return len(landmarks) >= 5  # We need at least 5 points to estimate the Golden Ratio


@app.route('/api/score', methods=['POST'])
def get_beauty_score():
    data = request.get_json()
    if 'landmarks' not in data:
        return jsonify({'error': 'Facial landmarks not provided'}), 400

    try:
        landmarks = data['landmarks']  # Landmarks passed from the frontend

        # Check for face detection
        if not detect_face(landmarks):
            return jsonify({'error': 'No valid face detected or image is unclear'}), 400

        # Perform the beauty analysis based on Golden Ratio
        score = analyze_image_for_beauty(landmarks)
        return jsonify({'score': f"{score}/100"})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
