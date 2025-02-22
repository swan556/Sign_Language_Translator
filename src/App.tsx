import React, { useEffect, useRef, useState } from 'react';
import { Camera, HandMetal, Settings2, AlertTriangle } from 'lucide-react';

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [prediction, setPrediction] = useState<string>('');

  useEffect(() => {
    if (isConnected) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isConnected]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    // Start sending frames every 200ms
    setInterval(captureFrame, 200);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach(track => track.stop());
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the video frame onto the canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg');

    // Send frame to backend
    const response = await fetch('https://sign-language-backend-production.up.railway.app/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData }),
    });

    const data = await response.json();
    setPrediction(data.prediction);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HandMetal className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold">Sign Language Detection</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsConnected(!isConnected)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isConnected
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } transition-colors`}
              >
                <Camera className="h-5 w-5" />
                <span>{isConnected ? 'Stop Camera' : 'Start Camera'}</span>
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Settings2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Video Feed */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl relative">
              {isConnected ? (
                <div className="relative">
                  <video ref={videoRef} className="w-full h-auto" autoPlay playsInline />
                  <canvas ref={canvasRef} className="hidden" width="640" height="480" />
                  {prediction && (
                    <div className="absolute top-4 left-4 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                      <p className="text-2xl font-bold">
                        Detected: <span className="text-blue-400">{prediction}</span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-700">
                  <div className="text-center">
                    <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">Camera is currently disabled</p>
                    <p className="text-sm text-gray-500">
                      Click the "Start Camera" button to begin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="font-medium">1.</span>
                <span>Position your hand clearly in front of the camera</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-medium">2.</span>
                <span>Make sure there's good lighting in your environment</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-medium">3.</span>
                <span>Keep your hand within the frame for best results</span>
              </li>
            </ul>

            {/* Caution Message */}
            <div className="mt-6 bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-200/90 text-sm">
                  Note: While our model strives for accuracy, predictions may not always be 100% correct. Please verify important signs and use context when interpreting results.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Status</h3>
              <div className="flex items-center space-x-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-gray-300">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {prediction && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Current Prediction</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-center text-blue-400">
                    {prediction}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
