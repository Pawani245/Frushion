'use client';
import React, { useState, useEffect, useRef } from 'react';

function ExpressionCard() {
  const [expression, setExpression] = useState('');
  const [emoji, setEmoji] = useState('🤔');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const [isAnalysisActive, setIsAnalysisActive] = useState(false); // New state to track button press

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access error:', err);
      }
    };
    startCamera();
  }, []);

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Check if the canvas was drawn correctly
    if (ctx.getImageData(0, 0, canvas.width, canvas.height).data.length === 0) {
      console.error("Canvas drawing failed!");
      return;
    }

    canvas.toBlob(blob => {
      if (blob) sendFrame(blob);
    }, 'image/jpeg');
  };

  const sendFrame = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/analyze_expression', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.status === 'success') {
        setExpression(result.expression);
        setEmoji(result.emoji);
        setMessage(result.message);
        triggerAnimation(result.expression);
      } else {
        console.warn('Expression detection failed:', result.message);
        setExpression('unknown');
        setEmoji('🤔');
        setMessage(result.message || 'Unable to detect expression.');
      }
    } catch (err) {
      console.error('Error sending frame:', err);
      setExpression('error');
      setEmoji('❌');
      setMessage('Could not analyze expression.');
    } finally {
      setLoading(false);
    }
  };

  const triggerAnimation = (mood) => {
    if (/happy|smile/i.test(mood)) setAnimationState('bounce');
    else if (/sad|cry|down/i.test(mood)) setAnimationState('pulse');
    else if (/angry|mad|frustrated/i.test(mood)) setAnimationState('wiggle');
    else setAnimationState('neutral');
  };

  const handleAnalysisClick = () => {
    setIsAnalysisActive(true);
    captureAndSendFrame(); // Trigger the analysis when the button is clicked
  };

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
            <p className="text-xl text-white font-bold">{expression || 'No mood detected yet'}</p>
            <p className="text-sm text-white italic mt-2">{message}</p>
          </>
        )}
      </div>

      <div className="mt-4 text-sm text-white px-4 py-2 rounded-full shadow-xl bg-black bg-opacity-50">
        {loading ? 'Analyzing your expression...' : 'No confidence data'}
      </div>

      <div className="mt-4">
        <button
          onClick={handleAnalysisClick}
          className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          Analyze Expression
        </button>
      </div>
    </div>
  );
}

export default ExpressionCard;
