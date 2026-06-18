import React from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
} from 'react-native-svg';

export interface TurnIconDef {
  key: string;
  label: string;
}

export const TURN_ICONS: Record<string, TurnIconDef> = {
  nail_polish: { key: 'nail_polish', label: 'Nail Polish' },
  hand: { key: 'hand', label: 'Hand' },
  gel_lamp: { key: 'gel_lamp', label: 'UV/Gel Lamp' },
  nail_file: { key: 'nail_file', label: 'Nail File' },
  acrylic: { key: 'acrylic', label: 'Acrylic' },
  scissors: { key: 'scissors', label: 'Scissors' },
  brush: { key: 'brush', label: 'Brush' },
  palette: { key: 'palette', label: 'Palette' },
  sparkle: { key: 'sparkle', label: 'Sparkle' },
  drop: { key: 'drop', label: 'Drop' },
  flower: { key: 'flower', label: 'Flower' },
  leaf: { key: 'leaf', label: 'Leaf' },
  diamond: { key: 'diamond', label: 'Diamond' },
  star: { key: 'star', label: 'Star' },
  heart: { key: 'heart', label: 'Heart' },
  foot: { key: 'foot', label: 'Foot' },
  wax: { key: 'wax', label: 'Wax' },
  timer: { key: 'timer', label: 'Timer' },
  crown: { key: 'crown', label: 'Crown' },
  ribbon: { key: 'ribbon', label: 'Ribbon' },
  soak: { key: 'soak', label: 'Soak' },
  french: { key: 'french', label: 'French Tip' },
  chrome: { key: 'chrome', label: 'Chrome' },
  combo: { key: 'combo', label: 'Combo' },
};

export const TURN_ICON_LIST = Object.values(TURN_ICONS);

const SP = {
  fill: 'none',
  strokeWidth: 1.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function IconSvg({ icon, size, color }: { icon: string; size: number; color: string }) {
  const s = { ...SP, stroke: color };

  switch (icon) {
    case 'nail_polish':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Rect x={8} y={14} width={8} height={8} rx={1.5} {...s} />
          <Path d="M9.5 14V11.5C9.5 10.5 10 9 12 7C14 9 14.5 10.5 14.5 11.5V14" {...s} />
          <Rect x={11} y={3} width={2} height={4} rx={0.5} {...s} />
        </Svg>
      );
    case 'hand':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M8 13V7.5C8 6.67 8.67 6 9.5 6S11 6.67 11 7.5V12" {...s} />
          <Path d="M11 11.5V5.5C11 4.67 11.67 4 12.5 4S14 4.67 14 5.5V11.5" {...s} />
          <Path d="M14 11V6.5C14 5.67 14.67 5 15.5 5S17 5.67 17 6.5V13" {...s} />
          <Path d="M8 13C8 13 6 11 5.5 10.5C4.83 9.83 4 10 4 11C4 12 6 15 7 17C8 19 9 21 12 21C16 21 18 18 18 15V13" {...s} />
        </Svg>
      );
    case 'gel_lamp':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M4 8h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" {...s} />
          <Path d="M6 8V5a1 1 0 011-1h10a1 1 0 011 1v3" {...s} />
          <Path d="M9 13v2" {...s} />
          <Path d="M12 12v3" {...s} />
          <Path d="M15 13v2" {...s} />
        </Svg>
      );
    case 'nail_file':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M6 20L18 4" {...s} />
          <Path d="M4.5 18.5L7.5 21.5" {...s} />
          <Path d="M16.5 2.5L19.5 5.5" {...s} />
          <Path d="M5.25 19.75l14-14" {...s} />
          <Path d="M8 13l-1 1" {...s} />
          <Path d="M11 10l-1 1" {...s} />
          <Path d="M14 7l-1 1" {...s} />
        </Svg>
      );
    case 'acrylic':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M8 21h8" {...s} />
          <Path d="M9 21v-4c0-2 1-6 3-10c2 4 3 8 3 10v4" {...s} />
          <Path d="M9.5 13h5" {...s} />
          <Ellipse cx={12} cy={6} rx={2} ry={2.5} {...s} />
        </Svg>
      );
    case 'scissors':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Circle cx={6} cy={6} r={3} {...s} />
          <Circle cx={6} cy={18} r={3} {...s} />
          <Path d="M8.12 8.12L20 20" {...s} />
          <Path d="M8.12 15.88L20 4" {...s} />
          <Path d="M14 12h2" {...s} />
        </Svg>
      );
    case 'brush':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M12 21c-1.5 0-3-1-3-3 0-1.5 1.5-2.5 3-4 1.5 1.5 3 2.5 3 4 0 2-1.5 3-3 3z" {...s} />
          <Path d="M12 14V3" {...s} />
          <Path d="M9 3l3 4 3-4" {...s} />
        </Svg>
      );
    case 'palette':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c3.1 0 5.6-2.5 5.6-5.6C22 5.8 17.5 2 12 2z" {...s} />
          <Circle cx={8} cy={10} r={1.5} fill={color} stroke="none" />
          <Circle cx={12} cy={7} r={1.5} fill={color} stroke="none" />
          <Circle cx={16} cy={10} r={1.5} fill={color} stroke="none" />
          <Circle cx={9} cy={14.5} r={1.5} fill={color} stroke="none" />
        </Svg>
      );
    case 'sparkle':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2z" {...s} />
          <Path d="M19 15l.5 2.5L22 18l-2.5.5L19 21l-.5-2.5L16 18l2.5-.5L19 15z" {...s} />
        </Svg>
      );
    case 'drop':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M12 2C12 2 6 10 6 15a6 6 0 1012 0C18 10 12 2 12 2z" {...s} />
          <Path d="M10 15.5c0-1.5 1-3 2-4" {...s} />
        </Svg>
      );
    case 'flower':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Circle cx={12} cy={12} r={3} {...s} />
          <Path d="M12 2C12 2 13.5 5.5 12 9" {...s} />
          <Path d="M12 15c1.5 3.5 0 7 0 7" {...s} />
          <Path d="M2 12c0 0 3.5-1.5 7 0" {...s} />
          <Path d="M15 12c3.5 1.5 7 0 7 0" {...s} />
          <Path d="M4.93 4.93c0 0 2.83 1.77 3.54 4.6" {...s} />
          <Path d="M15.54 15.54c1.76 2.83 3.53 3.53 3.53 3.53" {...s} />
          <Path d="M19.07 4.93c0 0-1.77 2.83-4.6 3.54" {...s} />
          <Path d="M8.46 15.54c-2.83 1.76-3.53 3.53-3.53 3.53" {...s} />
        </Svg>
      );
    case 'leaf':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M6 21C6 21 6 12 12 6C18 6 20 3 20 3C20 3 20 14 12 18C8 20 6 21 6 21z" {...s} />
          <Path d="M7 20C9 16 13 12 19 4" {...s} />
        </Svg>
      );
    case 'diamond':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M6 3h12l4 7-10 12L2 10l4-7z" {...s} />
          <Path d="M2 10h20" {...s} />
          <Path d="M10 3l-2 7 4 12 4-12-2-7" {...s} />
        </Svg>
      );
    case 'star':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M12 2l2.94 6.34L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l7.06-.93L12 2z" {...s} />
        </Svg>
      );
    case 'heart':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12 5C12.09 3.81 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14 12 21 12 21z" {...s} />
        </Svg>
      );
    case 'foot':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M6 16c0 3 2 5 5 5h2c3 0 4-2 4-4 0-3-2-5-3-8s0-6 0-6" {...s} />
          <Path d="M14 3c0 0-4 1-6 5s-3 6-2 8" {...s} />
          <Ellipse cx={8.5} cy={6.5} rx={1} ry={1.5} fill={color} stroke="none" />
          <Ellipse cx={6} cy={8.5} rx={0.8} ry={1.2} fill={color} stroke="none" />
          <Ellipse cx={4.5} cy={11} rx={0.8} ry={1.2} fill={color} stroke="none" />
          <Ellipse cx={4.5} cy={14} rx={0.8} ry={1} fill={color} stroke="none" />
        </Svg>
      );
    case 'wax':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Rect x={5} y={8} width={14} height={12} rx={2} {...s} />
          <Path d="M5 12c2-2 4 1 7-1s5 1 7-1" {...s} />
          <Path d="M9 8V5a3 3 0 016 0v3" {...s} />
          <Path d="M12 2v1" {...s} />
          <Path d="M10 3l-1-1" {...s} />
          <Path d="M14 3l1-1" {...s} />
        </Svg>
      );
    case 'timer':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Circle cx={12} cy={13} r={8} {...s} />
          <Path d="M12 9v4l2.5 2.5" {...s} />
          <Path d="M10 2h4" {...s} />
          <Path d="M12 2v2" {...s} />
          <Path d="M19.5 5.5l-1 1" {...s} />
        </Svg>
      );
    case 'crown':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M3 18V8l4 4 5-6 5 6 4-4v10H3z" {...s} />
          <Path d="M3 18h18" {...s} />
          <Circle cx={12} cy={6} r={0.5} fill={color} stroke="none" />
        </Svg>
      );
    case 'ribbon':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M12 6c2 0 4 1 4 3s-2 3-4 3-4-1-4-3 2-3 4-3z" {...s} />
          <Path d="M8 11l-3 10 4.5-3 2.5 4 2.5-4 4.5 3-3-10" {...s} />
        </Svg>
      );
    case 'soak':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M4 12h16" {...s} />
          <Path d="M5 12c0 5 3 8 7 8s7-3 7-8" {...s} />
          <Path d="M8 8c0.5-1 1.5-1 2 0s1.5 1 2 0 1.5-1 2 0 1.5 1 2 0" {...s} />
          <Path d="M9 5V3" {...s} />
          <Path d="M12 5V2" {...s} />
          <Path d="M15 5V3" {...s} />
        </Svg>
      );
    case 'french':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d="M8 21V12C8 7 9.5 3 12 3s4 4 4 9v9" {...s} />
          <Path d="M8 21h8" {...s} />
          <Path d="M8 8c1.5 2 6.5 2 8 0" {...s} />
        </Svg>
      );
    case 'chrome':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Ellipse cx={10} cy={10} rx={4} ry={5} {...s} />
          <Path d="M14 8c1 1.5 1 4 0 6" {...s} />
        </Svg>
      );
    case 'combo':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Circle cx={9.5} cy={12} r={6} {...s} />
          <Circle cx={14.5} cy={12} r={6} {...s} />
        </Svg>
      );
    default:
      return null;
  }
}

export function TurnIcon({
  icon,
  size = 24,
  color = '#1A1A18',
}: {
  icon: string;
  size?: number;
  color?: string;
}) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <IconSvg icon={icon} size={size} color={color} />
    </View>
  );
}
