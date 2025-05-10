'use client';
import { useRef, useEffect, useState } from 'react';

export default function Home() {
  const videoRef = useRef(null);
  const [score, setScore] = useState(null);

  useEffect(() => {
    // Access webcam
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Capture every 10 seconds
      const interval = setInterval(() => {
        captureAndSendFrame();
      }, 10000); // 10 seconds

      return () => clearInterval(interval);
    });
  }, []);

  const captureAndSendFrame = async () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;

    if (!video || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('frame', blob, 'frame.jpg');

      try {
        const res = await fetch('http://localhost:5000/analyze', {
          method: 'POST',
          body: formData,
        });

        const result = await res.json();
        if (result.score) {
          setScore(result.score);
        }
      } catch (err) {
        console.error("Error contacting backend:", err);
      }
    }, 'image/jpeg');
  };

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h1>Live Beauty Score Analyzer</h1>
      <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />
      <h2>
        Beauty Score: {score !== null ? <span>{score} / 100</span> : 'Waiting for analysis...'}
      </h2>
    </div>
  );
}
