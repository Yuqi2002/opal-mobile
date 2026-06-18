import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 80,
  height = 28,
  strokeColor,
  fillColor,
  strokeWidth = 1.5,
}: SparklineProps) {
  const { colors } = useTheme();
  const lineColor = strokeColor ?? colors.goldDeep;
  const areaColor = fillColor ?? colors.goldLight;

  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * usableW;
    const y = padding + usableH - ((v - min) / range) * usableH;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(' ');

  // Build filled area polygon: line points + bottom-right + bottom-left
  const firstX = padding;
  const lastX = padding + usableW;
  const bottomY = height;
  const fillPoints = `${polylinePoints} ${lastX},${bottomY} ${firstX},${bottomY}`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={areaColor} stopOpacity="0.4" />
            <Stop offset="1" stopColor={areaColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Polygon points={fillPoints} fill="url(#sparkFill)" />
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
