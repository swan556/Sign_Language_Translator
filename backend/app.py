from flask import Flask, render_template, Response, request
import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import threading
import time
from collections import deque
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model
model = tf.keras.models.load_model("pretrained_model.h5")
model.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7, min_tracking_confidence=0.6)
mp_draw = mp.solutions.drawing_utils

# Webcam
cap = None
frame_queue = deque(maxlen=1)
prediction_queue = deque(maxlen=5)

# Label Mapping (Modify if necessary)
labels = {i: chr(65 + i) for i in range(25)}

# Global variables
current_prediction = "..."
active_clients = 0
frame_skip = 5  
frame_counter = 0  

def capture_frames():
    """Continuously capture frames."""
    global cap
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FPS, 30)

    while active_clients > 0:
        success, frame = cap.read()
        if success:
            frame = cv2.flip(frame, 1)  
            frame_queue.append(frame)  

        time.sleep(0.03)  

    if cap is not None:
        cap.release()
        cap = None
        print("Camera released.")

def normalize_landmarks(landmarks):
    """Normalize landmarks using the wrist (first landmark)."""
    landmarks = np.array([[lm.x, lm.y, lm.z] for lm in landmarks])
    if landmarks.shape[0] == 21:
        wrist = landmarks[0]
        landmarks -= wrist  
        return landmarks.ravel().reshape(1, -1)
    return None

def process_landmarks(landmarks):
    """Run prediction with normalized landmarks."""
    global current_prediction

    normalized_data = normalize_landmarks(landmarks)
    if normalized_data is not None:
        try:
            prediction = model.predict(normalized_data)
            class_index = np.argmax(prediction)
            predicted_label = labels.get(class_index, '?')
            prediction_queue.append(predicted_label)

            # Smoothing: Use the most common prediction from recent frames
            current_prediction = max(set(prediction_queue), key=prediction_queue.count)

        except Exception as e:
            print("Prediction Error:", e)
            current_prediction = "Error"

def generate_frames():
    """Process frames and run model prediction."""
    global frame_counter

    if cap is None:
        threading.Thread(target=capture_frames, daemon=True).start()

    while active_clients > 0:
        if not frame_queue:
            continue  

        frame = frame_queue[-1]  
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        if results.multi_hand_landmarks and frame_counter % frame_skip == 0:
            for hand_landmarks in results.multi_hand_landmarks:
                threading.Thread(target=process_landmarks, args=(hand_landmarks.landmark,), daemon=True).start()
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        cv2.putText(frame, f"Prediction: {current_prediction}", (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        frame_counter += 1  

    print("Stopped video stream.")

@app.route('/')
def index():
    return "Sign Language Detection API"

@app.route('/video_feed')
def video_feed():
    global active_clients
    active_clients += 1
    print(f"Client connected. Active clients: {active_clients}")
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/disconnect')
def disconnect():
    global active_clients
    active_clients = max(0, active_clients - 1)
    print(f"Client disconnected. Active clients: {active_clients}")
    return "", 204

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)