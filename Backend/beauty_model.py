import cv2
import numpy as np

def calculate_beauty_score(image):
    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Calculate the brightness as a proxy for beauty (this is a basic example)
    brightness = np.mean(gray)
    
    # Normalize the brightness to a scale of 0-10 for the beauty score
    score = (brightness / 255) * 10
    return round(score, 2)
