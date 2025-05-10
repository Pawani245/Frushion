'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { saveAs } from 'file-saver';
import { PulseLoader } from 'react-spinners'; // For the loading spinner

const AnalysisCard: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const [savedAnalysis, setSavedAnalysis] = useState<any[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [realSkinTone, setRealSkinTone] = useState<string>('No analysis yet');
  const [realTexture, setRealTexture] = useState<string>('No analysis yet');
  const [skinElasticity, setSkinElasticity] = useState<string>('No analysis yet');
  const [hydrationLevel, setHydrationLevel] = useState<string>('No analysis yet');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false); // Track if analysis is happening
  const [isLoading, setIsLoading] = useState<boolean>(false); // Track loading state
  const videoRef = useRef<HTMLVideoElement>(null);

  // Placeholder data for the charts
  const skinToneData = [
    { name: 'Deep', uv: 40 },
    { name: 'Tan', uv: 70 },
    { name: 'Medium', uv: 90 },
    { name: 'Light', uv: 120 },
    { name: 'Fair', uv: 150 },
  ];

  const textureData = [
    { name: 'Smooth', uv: 15 },
    { name: 'Oily', uv: 30 },
    { name: 'Rough', uv: 45 },
  ];

  // Start camera stream only once when the component mounts
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam', err);
      }
    };

    startCamera();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Trigger analysis when the button is clicked
  const handleAnalysis = () => {
    setIsLoading(true); // Show loading spinner
    setIsAnalyzing(true); // Start the analysis process

    // Simulate skin tone detection based on a value `v` (e.g., average brightness, skin color detection, etc.)
    const v = Math.random(); // Replace with actual skin tone detection logic
    let detectedSkinTone = '';
    if (v < 0.4) {
      detectedSkinTone = 'Deep';
    } else if (v < 0.55) {
      detectedSkinTone = 'Tan';
    } else if (v < 0.7) {
      detectedSkinTone = 'Medium';
    } else if (v < 0.85) {
      detectedSkinTone = 'Light';
    } else {
      detectedSkinTone = 'Fair';
    }
    setRealSkinTone(detectedSkinTone);

    // Simulate texture analysis based on texture variance
    const texture_variance = Math.random() * 100; // Replace with actual texture variance calculation
    let detectedTexture = '';
    let calculatedElasticity = '';
    let calculatedHydration = '';

    if (texture_variance < 10) {
      detectedTexture = 'Very Smooth';
      calculatedElasticity = 'High'; // Smooth texture often indicates high elasticity
      calculatedHydration = 'Optimal'; // Well-hydrated skin is smooth and even
    } else if (texture_variance < 25) {
      detectedTexture = 'Smooth';
      calculatedElasticity = 'Moderate'; // Smooth but may show slight signs of low elasticity
      calculatedHydration = 'Good'; // Hydrated but not optimal
    } else if (texture_variance < 40) {
      detectedTexture = 'Normal';
      calculatedElasticity = 'Moderate'; // Typical skin elasticity
      calculatedHydration = 'Average'; // May need more hydration
    } else if (texture_variance > 40 && texture_variance <= 60) {
      detectedTexture = 'Dry';
      calculatedElasticity = 'Low'; // Dry skin shows signs of lower elasticity
      calculatedHydration = 'Low'; // Dry skin is generally not hydrated
    } else if (texture_variance > 60) {
      detectedTexture = 'Acne-Prone';
      calculatedElasticity = 'Low'; // Acne-prone skin can have low elasticity
      calculatedHydration = 'Very Low'; // Often associated with poor hydration
    } else {
      detectedTexture = 'Oily';
      calculatedElasticity = 'Moderate'; // Oily skin may have good elasticity
      calculatedHydration = 'High'; // Oily skin may appear hydrated, but not always
    }

    setRealTexture(detectedTexture);
    setSkinElasticity(calculatedElasticity);
    setHydrationLevel(calculatedHydration);

    setTimeout(() => {
      setIsLoading(false); // Hide loading spinner after analysis
    }, 2000); // Simulate analysis time
  };

  // Reset the analysis to allow another run
  const handleReanalyze = () => {
    setIsAnalyzing(false); // Reset analysis state
    setRealSkinTone('No analysis yet');
    setRealTexture('No analysis yet');
    setSkinElasticity('No analysis yet');
    setHydrationLevel('No analysis yet');
  };

  // Save the analysis data
  const handleSaveAnalysis = () => {
    const analysisData = {
      skinTone: realSkinTone,
      texture: realTexture,
      elasticity: skinElasticity,
      hydration: hydrationLevel,
      timestamp: new Date().toISOString(),
    };
    setSavedAnalysis([...savedAnalysis, analysisData]);

    const csvData = [
      ['Skin Tone', 'Texture', 'Elasticity', 'Hydration', 'Timestamp'],
      [analysisData.skinTone, analysisData.texture, analysisData.elasticity, analysisData.hydration, analysisData.timestamp],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    saveAs(blob, 'analysis_report.csv');
  };

  // View saved analysis
  const handleViewSavedAnalysis = () => {
    alert('Saved Analysis: ' + JSON.stringify(savedAnalysis, null, 2));
  };

  return (
    <div className="bg-gradient-to-b from-blue-900 to-purple-700 p-6 rounded-xl shadow-md text-white">
      <h2 className="text-2xl font-semibold mb-4 text-center">Live Skin Analysis</h2>

      {/* Hidden video feed */}
      <video ref={videoRef} autoPlay playsInline width="0" height="0" className="hidden" />

      {/* Texture Info Always Visible */}
      <div className="bg-blue-800 p-4 rounded-md mb-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Texture Details</h3>
        <ul className="list-disc pl-4">
          <li>Texture: {realTexture}</li>
          <li>Skin Elasticity: {skinElasticity}</li> {/* Skin Elasticity */}
          <li>Hydration Level: {hydrationLevel}</li> {/* Hydration Level */}
          <li>Skin Tone: {realSkinTone}</li> {/* Skin Tone */}
          <li>Tip: Keep hydrated for better skin texture!</li>
        </ul>
      </div>

      {/* Trigger analysis button */}
      {!isAnalyzing && (
        <button
          onClick={handleAnalysis}
          className="bg-purple-500 text-white p-3 rounded-md w-full hover:bg-purple-400 mb-4 shadow-md transition duration-300"
        >
          {isLoading ? <PulseLoader color="#fff" size={10} /> : 'Start Analysis'}
        </button>
      )}

      {/* Reanalyze Button after analysis */}
      {isAnalyzing && !isLoading && (
        <button
          onClick={handleReanalyze}
          className="bg-blue-500 text-white p-3 rounded-md w-full hover:bg-blue-400 mb-4 shadow-md transition duration-300"
        >
          Reanalyze
        </button>
      )}

      {/* Toggle Charts & Buttons */}
      <div className="text-white mb-4 flex justify-between items-center">
        <span>Further Analysis</span>
        <span
          onClick={() => setShowMore(!showMore)}
          className="text-gray-400 cursor-pointer hover:text-gray-200"
        >
          {showMore ? 'Hide' : 'See More'}
        </span>
      </div>

      {/* Charts & Action Buttons after clicking "See More" */}
      {showMore && (
        <>
          {/* Skin Tone Chart */}
          <div className="bg-blue-800 p-4 rounded-md mb-4 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Skin Tone Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={skinToneData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uv" stroke="#ffffff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Texture Chart */}
          <div className="bg-blue-800 p-4 rounded-md mb-4 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Skin Texture Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={textureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uv" stroke="#ffffff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Save and View Saved Analysis Buttons */}
          <button
            onClick={handleSaveAnalysis}
            className="bg-indigo-500 text-white p-3 rounded-md w-full mb-4 hover:bg-indigo-400 transition duration-300"
          >
            Save Analysis
          </button>

          <button
            onClick={handleViewSavedAnalysis}
            className="bg-teal-500 text-white p-3 rounded-md w-full hover:bg-teal-400 transition duration-300"
          >
            View Saved Analysis
          </button>
        </>
      )}
    </div>
  );
};

export default AnalysisCard;
