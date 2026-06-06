import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Very basic mock of D3 or SVG heatmap
export default function HeatmapView() {
  const hotspots = [
    { cx: 150, cy: 100, r: 20, count: 5, label: 'Library' },
    { cx: 300, cy: 200, r: 35, count: 12, label: 'Canteen' },
    { cx: 100, cy: 250, r: 15, count: 3, label: 'Hostel A' },
    { cx: 400, cy: 120, r: 25, count: 8, label: 'Sports Complex' },
  ];

  return (
    <div className="min-h-screen bg-[#1E1E2E] text-white p-6 pt-24 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Lost Item Hotspots</h1>
        <Card className="bg-[#2A2A3C] border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Campus Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden bg-[#1E1E2E] border border-gray-700 rounded-lg relative">
              <svg viewBox="0 0 500 350" className="w-full h-auto">
                {/* Mock Map Background Paths */}
                <rect width="500" height="350" fill="#1E1E2E" />
                <path d="M50 50 L450 50 L450 300 L50 300 Z" fill="none" stroke="#3A3A4C" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M250 50 L250 300" fill="none" stroke="#3A3A4C" strokeWidth="2" />
                <path d="M50 175 L450 175" fill="none" stroke="#3A3A4C" strokeWidth="2" />
                
                {/* Hotspots */}
                {hotspots.map((spot, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={spot.cx} 
                      cy={spot.cy} 
                      r={spot.r} 
                      fill="rgba(239, 68, 68, 0.4)" 
                      stroke="#ef4444" 
                      strokeWidth="2"
                    >
                      <animate attributeName="r" values={`${spot.r};${spot.r + 5};${spot.r}`} dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x={spot.cx} y={spot.cy - spot.r - 10} fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">
                      {spot.label}
                    </text>
                    <text x={spot.cx} y={spot.cy + 4} fill="white" fontSize="10" textAnchor="middle">
                      {spot.count} items
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
