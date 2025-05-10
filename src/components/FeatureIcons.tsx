'use client';
import { useState } from 'react';

const icons = ['lips', 'eye', 'brows', 'proportion', 'skin', 'face', 'eyeshadow'];

export default function FeatureIcons() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = async (filter: string) => {
    const isSelected = selectedFilters.includes(filter);
    const newFilters = isSelected
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];

    setSelectedFilters(newFilters);

    try {
      await fetch('http://localhost:5000/apply-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: newFilters }),
      });
    } catch (error) {
      console.error('Failed to send filters:', error);
    }
  };

  return (
    <div className="flex gap-2 items-center justify-center mt-2 bg-black/50 p-2 rounded-xl">
      {icons.map((icon, index) => (
        <img
          key={index}
          src={`/assets/${icon}.png`}
          alt={icon}
          onClick={() => toggleFilter(icon)}
          className={`w-8 h-8 cursor-pointer rounded-md p-1 transition ${
            selectedFilters.includes(icon)
              ? 'bg-white shadow-lg scale-110'
              : 'opacity-60 hover:opacity-100'
          }`}
        />
      ))}
    </div>
  );
}
