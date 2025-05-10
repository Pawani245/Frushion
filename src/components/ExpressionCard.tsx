'use client';
import React, { useState, useEffect, useRef } from 'react';

function ExpressionCard() {
  const [expression, setExpression] = useState('');
  const [emoji, setEmoji] = useState('🤔');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [animationState, setAnimationState] = useState('idle');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');  // Load face detection model
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');  // Load expression recognition model
    };

    loadModels().then(() => {
      console.log("Models loaded successfully");
    }).catch((err) => {
      console.error("Error loading models:", err);
    });
  }, []);

  // Start camera stream
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setMessage('Unable to access camera. Please check permissions.');
      }
    };

    startCamera();
  }, []);

  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Detect faces and expressions using face-api.js
    const detections = await faceapi.detectAllFaces(video).withFaceExpressions();

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      const dominantExpression = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );
      setExpression(dominantExpression);
      setEmoji(getEmojiForExpression(dominantExpression));
      setMessage(`Confidence: ${expressions[dominantExpression].toFixed(2)}`);
      triggerAnimation(dominantExpression);
    } else {
      setExpression('No face detected');
      setEmoji('🤔');
      setMessage('Unable to detect face');
    }

    // Draw the face detection results on the canvas
    faceapi.draw.drawDetections(canvas, detections);
    faceapi.draw.drawFaceExpressions(canvas, detections);
  };

  const getEmojiForExpression = (expression) => {
    switch (expression) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😡';
      case 'surprised': return '😲';
      case 'neutral': return '😐';
      default: return '🤔';
    }
  };

  const triggerAnimation = (mood) => {
    if (/happy|smile/i.test(mood)) setAnimationState('bounce');
    else if (/sad|cry|down/i.test(mood)) setAnimationState('pulse');
    else if (/angry|mad|frustrated/i.test(mood)) setAnimationState('wiggle');
    else setAnimationState('neutral');
  };

  // Continuously capture frames and analyze every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      captureAndAnalyzeFrame();
    }, 100); // Adjust the interval for real-time performance

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl text-center shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out relative">
      <h2 className="text-3xl font-semibold text-white mb-4">Expression Detection</h2>

      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-t-4 border-r-4 border-white border-solid rounded-full animate-spin"></div>
            <span className="ml-4 text-white text-lg">Analyzing...</span>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center mb-4">
              <div
                className={`w-40 h-40 rounded-full ${
                  expression ? 'bg-green-500' : 'bg-gray-500'
                } flex items-center justify-center text-white font-bold text-6xl ${
                  animationState === 'bounce'
                    ? 'animate-bounce'
                    : animationState === 'pulse'
                    ? 'animate-pulse'
                    : animationState === 'wiggle'
                    ? 'animate-[wiggle_1s_ease-in-out_infinite]'
                    : ''
                }`}
              >
                {emoji}
              </div>
            </div>
            <p className="text-xl text-white font-bold">
              {expression || 'Expression not detected yet'}
            </p>
            <p className="text-sm text-white italic mt-2">{message}</p>
          </>
        )}
      </div>

      <div className="mt-4 text-sm text-white px-4 py-2 rounded-full shadow-xl bg-black bg-opacity-50">
        {loading ? 'Analyzing your expression...' : 'No confidence data'}
      </div>
    </div>
  );
}

export default ExpressionCard;
