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
  showYAxis?: boolean;
  formatValue?: (v: number) => string;
}

function niceTickValues(max: number, count: number): number[] {
  const rough = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const nice = [1, 2, 2.5, 5, 10].find((n) => n * mag >= rough)! * mag;
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += nice) {
    ticks.push(Math.round(v));
  }
  // Always add one tick above max so bars never touch the top
  if (ticks.length === 0 || ticks[ticks.length - 1] <= max) {
    ticks.push(Math.round((ticks[ticks.length - 1] ?? 0) + nice));
  }
  return ticks;
}

export function BarChart({
  data,
  height = 120,
  barColor,
  labelColor,
  showYAxis = true,
  formatValue,
}: BarChartProps) {
  const { colors } = useTheme();
  const fill = barColor ?? colors.gold;
  const lbl = labelColor ?? colors.textMuted;

  const max = Math.max(...data.map((d) => d.value), 1);
  const ticks = showYAxis ? niceTickValues(max, 3) : [];
  const ceiling = ticks.length > 0 ? ticks[ticks.length - 1] : max;
  const fmt = formatValue ?? ((v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`);

  return (
    <View style={styles.container}>
      {/* Chart area */}
      <View style={styles.chartRow}>
        {/* Y-axis labels */}
        {showYAxis && (
          <View style={[styles.yAxis, { height }]}>
            {[...ticks].reverse().map((tick) => (
              <Text
                key={tick}
                style={[
                  styles.yLabel,
                  {
                    color: colors.textFaint,
                    bottom: (tick / ceiling) * height - 6,
                  },
                ]}
              >
                {fmt(tick)}
              </Text>
            ))}
          </View>
        )}

        {/* Bars */}
        <View style={[styles.barsRow, { height }]}>
          {/* Gridlines */}
          {showYAxis &&
            ticks.map((tick) => (
              <View
                key={tick}
                style={[
                  styles.gridline,
                  {
                    backgroundColor: colors.border,
                    bottom: (tick / ceiling) * height,
                  },
                ]}
              />
            ))}

          {data.map((d, i) => {
            const barH = (d.value / ceiling) * height;
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
              </View>
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={[styles.xLabels, showYAxis ? { marginLeft: 38 } : undefined]}>
        {data.map((d, i) => (
          <View key={i} style={styles.xLabelCol}>
            <Text style={[styles.label, { color: lbl }]}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Line Chart ──────────────────────────────────────────

interface LineDatum {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineDatum[];
  height?: number;
  lineColor?: string;
  labelColor?: string;
  showYAxis?: boolean;
  formatValue?: (v: number) => string;
  showDots?: boolean;
  /** Show every Nth x-axis label (default: 1 = show all) */
  xLabelInterval?: number;
}

export function LineChart({
  data,
  height = 120,
  lineColor,
  labelColor,
  showYAxis = true,
  formatValue,
  showDots = true,
  xLabelInterval = 1,
}: LineChartProps) {
  const { colors } = useTheme();
  const stroke = lineColor ?? colors.gold;
  const lbl = labelColor ?? colors.textMuted;

  const max = Math.max(...data.map((d) => d.value), 1);
  const ticks = showYAxis ? niceTickValues(max, 3) : [];
  const ceiling = ticks.length > 0 ? ticks[ticks.length - 1] : max;
  const fmt = formatValue ?? ((v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`);

  // Compute point positions (0-1 range)
  const points = data.map((d, i) => ({
    x: data.length > 1 ? i / (data.length - 1) : 0.5,
    y: 1 - d.value / ceiling,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        {/* Y-axis labels */}
        {showYAxis && (
          <View style={[styles.yAxis, { height }]}>
            {[...ticks].reverse().map((tick) => (
              <Text
                key={tick}
                style={[
                  styles.yLabel,
                  {
                    color: colors.textFaint,
                    bottom: (tick / ceiling) * height - 6,
                  },
                ]}
              >
                {fmt(tick)}
              </Text>
            ))}
          </View>
        )}

        {/* Line area */}
        <View style={[styles.barsRow, { height }]}>
          {/* Gridlines */}
          {showYAxis &&
            ticks.map((tick) => (
              <View
                key={tick}
                style={[
                  styles.gridline,
                  {
                    backgroundColor: colors.border,
                    bottom: (tick / ceiling) * height,
                  },
                ]}
              />
            ))}

          {/* SVG-like line using absolute-positioned segments and dots */}
          {points.map((pt, i) => {
            const dotSize = 8;
            const left = pt.x * 100;
            const top = pt.y * height;

            return (
              <React.Fragment key={i}>
                {/* Dot */}
                {showDots && (
                  <View
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      top: top - dotSize / 2,
                      width: dotSize,
                      height: dotSize,
                      borderRadius: dotSize / 2,
                      backgroundColor: stroke,
                      marginLeft: -dotSize / 2,
                      zIndex: 2,
                    }}
                  />
                )}
                {/* Line segment to next point */}
                {i < points.length - 1 && (() => {
                  const next = points[i + 1];
                  // We'll use a thin rotated View as a line
                  const x1Pct = pt.x;
                  const x2Pct = next.x;
                  const y1 = pt.y * height;
                  const y2 = next.y * height;
                  // Need pixel x — approximate from 100% width
                  // We render inside a flex:1 container, use percentage-based positioning
                  return (
                    <LineSegment
                      x1Pct={x1Pct}
                      x2Pct={x2Pct}
                      y1={y1}
                      y2={y2}
                      color={stroke}
                      containerHeight={height}
                    />
                  );
                })()}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={[styles.xLabels, showYAxis ? { marginLeft: 38 } : undefined]}>
        {data.map((d, i) => (
          <View key={i} style={styles.xLabelCol}>
            <Text style={[styles.label, { color: lbl }]}>
              {(i % xLabelInterval === 0) ? d.label : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Draws a line segment between two points using a rotated View */
function LineSegment({
  x1Pct, x2Pct, y1, y2, color, containerHeight,
}: {
  x1Pct: number; x2Pct: number; y1: number; y2: number; color: string; containerHeight: number;
}) {
  const [width, setWidth] = React.useState(0);

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      pointerEvents="none"
    >
      {width > 0 && (() => {
        const x1 = x1Pct * width;
        const x2 = x2Pct * width;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            style={{
              position: 'absolute',
              left: x1,
              top: y1,
              width: length,
              height: 2,
              backgroundColor: color,
              borderRadius: 1,
              transformOrigin: 'left center',
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartRow: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 38,
    position: 'relative',
  },
  yLabel: {
    position: 'absolute',
    left: 0,
    fontSize: 10,
    fontFamily: 'Jost_400Regular',
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    position: 'relative',
  },
  gridline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    zIndex: 1,
  },
  barTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '65%',
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  xLabelCol: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
  },
});
