import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  barColor?: string;
  labelColor?: string;
}

export function BarChart({
  data,
  height = 120,
  barColor,
  labelColor,
}: BarChartProps) {
  const { colors } = useTheme();
  const fill = barColor ?? colors.gold;
  const lbl = labelColor ?? colors.textMuted;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={[styles.container, { height: height + 24 }]}>
      <View style={[styles.barsRow, { height }]}>
        {data.map((d, i) => {
          const barH = (d.value / max) * height;
          const isZero = d.value === 0;
          return (
            <View key={i} style={styles.barCol}>
              <View style={[styles.barTrack, { height }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: isZero ? 2 : barH,
                      backgroundColor: isZero ? colors.border : fill,
                      borderRadius: 4,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.label, { color: lbl }]}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '65%',
    minWidth: 12,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
    marginTop: 6,
  },
});
