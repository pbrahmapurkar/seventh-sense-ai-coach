// ProgressRing component for Seventh Sense AI Coach
// Pure SVG ring with customizable size, stroke, and progress

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const ProgressRing = ({ 
  size = 60, 
  stroke = 4, 
  progress = 0, 
  label, 
  color = '#6366f1',
  backgroundColor = '#e2e8f0',
  showPercentage = false,
  style = {}
}) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  // Calculate dimensions
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedProgress * circumference);
  
  // Center the SVG
  const center = size / 2;
  
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={stroke}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      
      {/* Optional label or percentage in center */}
      {(label || showPercentage) && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {label && (
            <Text 
              style={{
                fontSize: size * 0.2,
                fontWeight: '600',
                color: '#0f172a',
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {label}
            </Text>
          )}
          
          {showPercentage && !label && (
            <Text 
              style={{
                fontSize: size * 0.18,
                fontWeight: '600',
                color: '#0f172a',
                textAlign: 'center',
              }}
            >
              {Math.round(clampedProgress * 100)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ProgressRing;
