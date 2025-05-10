'use client';
import { useState } from 'react';
import FaceDisplay from './FaceDisplay';
import ScoreDisplay from './ScoreDisplay';

export default function LiveFaceAnalysis() {
  const [score, setScore] = useState<number | null>(null);

  return (
    <div className="space-y-4 flex flex-col items-center">
      <FaceDisplay setScore={setScore} />
      <ScoreDisplay score={score} />
    </div>
  );
}
