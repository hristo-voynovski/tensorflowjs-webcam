import React, { useRef, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import './App.css'; 

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const loadWebcam = async () => {
    try {
      const video = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });
      video.srcObject = stream;
  
      // Wait for the video metadata to load before calling play()
      video.onloadedmetadata = () => {
        video.play();
      };
    } catch (error) {
      console.error("Error accessing the camera: ", error);
      alert("Could not access the camera. Please check your permissions or if another app is using the camera.");
    }
  };

  const detectObjects = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const model = await cocoSsd.load();
    
    let frameCount = 0; // Counter to limit detection frequency

    const detect = async () => {
      if (frameCount % 5 === 0) { // Adjust the frequency (every 5th frame)
        const predictions = await model.detect(video);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        predictions.forEach(prediction => {
          context.beginPath();
          context.rect(...prediction.bbox);
          context.lineWidth = 2;
          context.strokeStyle = 'red';
          context.fillStyle = 'red';
          context.stroke();
          context.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            prediction.bbox[0],
            prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
          );
        });
      }
      frameCount++;
      requestAnimationFrame(detect);
    };

    detect();
  };

  useEffect(() => {
    loadWebcam().then(() => detectObjects());
  }, []);

  return (
    <div className="container">
      <h1 className="heading">TensorFlow Live Detection</h1>
      <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} />
      <canvas ref={canvasRef} width="640" height="480" className="canvas" />
    </div>
  );
};

export default App;
