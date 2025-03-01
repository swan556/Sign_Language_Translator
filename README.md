# Sign Language Detection Using Deep Learning

## 📌 Project Overview
This project is a *real-time Sign Language Detection System* that utilizes *computer vision and deep learning* to recognize hand gestures and predict corresponding sign language alphabets. The system processes a *live video feed, extracts hand landmarks, and classifies them using a **trained neural network model*.

## 🚀 Features
- *Real-Time Gesture Recognition* using a webcam.
- *Deep Learning Model* trained on hand landmarks for sign language classification.
- *Flask Backend* for handling video streaming and model inference.
- *React Frontend* with a sleek and interactive UI.
- *Smooth User Experience* with real-time predictions displayed dynamically.

## 🏗 Model Architecture
The *sign language classifier* is a *3-layered feed-forward neural network* trained on hand landmark data extracted using *MediaPipe Hands*.

### *🔢 Model Details*
- *Input:* 63-dimensional vector (21 hand landmarks × 3 coordinates each: x, y, z)
- *Hidden Layers:*
  - *Layer 1:* 128 neurons, ReLU activation
  - *Layer 2:* 64 neurons, ReLU activation
  - *Output Layer:* 25 neurons (for 25 alphabets except 'J' and 'Z'), Softmax activation
- *Loss Function:* Sparse Categorical Crossentropy
- *Optimizer:* Adam Optimizer
- *Dataset:* 1500 samples per alphabet (manually recorded hand landmarks)
- *Batch Size:* 32
- *Epochs:* 50

## 🏗 Tech Stack
### *Backend:*
- Flask
- OpenCV
- TensorFlow/Keras
- MediaPipe

### *Frontend:*
- React
- Tailwind CSS
- Lucide Icons

### *Deployment:*
- *Frontend:* Netlify
- *Backend:* Render

## 📂 Project Structure

📁 sign-language-detection
│── 📂 backend
│   │── app.py  # Flask server
│   │── pretrained_model.h5  # Trained model
│   │── requirements.txt  # Dependencies
│
│── 📂 frontend
│   │── src
│   │   │── App.tsx  # Main React file
│   │   │── components/  # UI Components
│   │── package.json  # React dependencies
│
│── README.md  # Project Documentation


## 🎯 How It Works
1️⃣ *User starts the camera*, and the system captures real-time hand gestures.
2️⃣ *MediaPipe Hands* detects hand landmarks and sends them to the model.
3️⃣ *Trained Neural Network* processes the landmarks and predicts the corresponding letter.
4️⃣ *The predicted sign is displayed* on the UI in real time.

## 🔧 Installation & Setup
### *1️⃣ Clone the repository*
bash
git clone https://github.com/your-repo/sign-language-detection.git
cd sign-language-detection


### *2️⃣ Setup the backend*
bash
cd backend
pip install -r requirements.txt
python app.py


### *3️⃣ Setup the frontend*
bash
cd frontend
npm install
npm run dev


### *4️⃣ Open in browser*

[http://localhost:5173/](https://glittery-tanuki-240cf1.netlify.app/)


## 📌 Future Enhancements
✅ Increase dataset size for better accuracy.  
✅ Train with a *CNN-based architecture* for improved performance.  
✅ Expand the model to support numbers and words.  

## 🏆 Acknowledgments
- *MediaPipe* for real-time hand tracking.
- *TensorFlow/Keras* for training the neural network.
- *Flask & React* for smooth integration of backend and frontend.

🎯 *This project showcases the power of AI and computer vision in breaking communication barriers!* 🚀
