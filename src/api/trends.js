// Express.js backend example
const express = require('express');
const app = express();
const port = 3000;

// Sample trend data
const trends = [
  {
    title: 'AI Skin Analysis',
    description: 'Real-time diagnostics with smart mirrors & mobile apps.',
    category: 'AI',
    tag: 'Tech',
    icon: <FaMicrochip />,
  },
  {
    title: 'Lab-Grown Skincare',
    description: 'Sustainable biotech ingredients like vegan collagen.',
    category: 'Eco',
    tag: 'Eco',
    icon: <FaLeaf />,
  },
  {
    title: 'Graphic Eyeliners',
    description: 'Vibrant, floating liners popular across runways & socials.',
    category: 'Style',
    tag: 'Style',
    icon: <FaEye />,
  },
  {
    title: 'Water-Saving Routines',
    description: 'Beauty routines designed to conserve water usage.',
    category: 'Eco',
    tag: 'Eco',
    icon: <FaWater />,
  },
];

app.get('/api/trends', (req, res) => {
  res.json(trends);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
