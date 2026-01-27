import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';
import { cardShadow } from '../theme/shadows';
import { CardSkeleton, EmptyState } from '../components';
import { api } from '../lib/api';

interface AnalyticsData {
  callsOverTime: { date: string; count: number }[];
  complaintsByStatus: { status: string; count: number }[];
  totalCalls: number;
  peakHour: string;
  totalComplaints: number;
  urgentActionsCount: number;
  avgHandlingTime: string;
  resolutionRate: number;
  // Trend data
  callsTrend?: number;
  complaintsTrend?: number;
  resolutionTrend?: number;
}

export const AnalyticsScreen: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await api.getAnalytics();
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchAnalytics(true);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Analytics</Text>
      <Text style={styles.headerSubtitle}>Store Performance Overview</Text>
    </View>
  );

  const renderTrendIndicator = (trend: number | undefined) => {
    if (trend === undefined) return null;
    const isPositive = trend >= 0;
    const trendColor = isPositive ? colors.success[500] : colors.error[500];
    const trendIcon = isPositive ? 'trending-up' : 'trending-down';

    return (
      <View style={[styles.trendContainer, { backgroundColor: isPositive ? colors.success[50] : colors.error[50] }]}>
        <Ionicons name={trendIcon} size={12} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {isPositive ? '+' : ''}{trend}%
        </Text>
      </View>
    );
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    trend?: number
  ) => (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{title}</Text>
      {renderTrendIndicator(trend)}
    </View>
  );

  const renderCircularProgress = (percentage: number) => {
    const size = 100;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.circularContainer}>
        <View style={styles.circularOuter}>
          <View style={[styles.circularTrack, { width: size, height: size, borderRadius: size / 2 }]}>
            <View style={[styles.circularProgress, {
              width: size - strokeWidth * 2,
              height: size - strokeWidth * 2,
              borderRadius: (size - strokeWidth * 2) / 2,
            }]}>
              <Text style={styles.circularValue}>{percentage}%</Text>
              <Text style={styles.circularLabel}>Resolved</Text>
            </View>
          </View>
          {/* Progress arc simulation with border */}
          <View style={[styles.progressArc, {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.success[500],
            borderTopColor: percentage >= 25 ? colors.success[500] : colors.gray[100],
            borderRightColor: percentage >= 50 ? colors.success[500] : colors.gray[100],
            borderBottomColor: percentage >= 75 ? colors.success[500] : colors.gray[100],
            borderLeftColor: percentage >= 100 ? colors.success[500] : colors.gray[100],
            transform: [{ rotate: '-45deg' }],
          }]} />
        </View>
      </View>
    );
  };

  const renderKeyMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Key Metrics</Text>
      <Text style={styles.sectionSubtitle}>Compared to last week</Text>
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Total Calls',
          data?.totalCalls ?? 0,
          'call',
          colors.info[500],
          data?.callsTrend
        )}
        {renderMetricCard(
          'Peak Hour',
          data?.peakHour ?? '-',
          'time',
          colors.warning[500]
        )}
        {renderMetricCard(
          'Total Complaints',
          data?.totalComplaints ?? 0,
          'chatbubble-ellipses',
          colors.error[500],
          data?.complaintsTrend
        )}
        {renderMetricCard(
          'Urgent Actions',
          data?.urgentActionsCount ?? 0,
          'flash',
          colors.primary[500]
        )}
      </View>
    </View>
  );

  const renderCallsChart = () => {
    if (!data?.callsOverTime?.length) return null;

    const maxCount = Math.max(...data.callsOverTime.map(d => d.count));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calls Over Time</Text>
        <View style={styles.chartCard}>
          <View style={styles.barChart}>
            {data.callsOverTime.slice(-7).map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: maxCount > 0 ? (item.count / maxCount) * 100 : 0,
                      backgroundColor: colors.primary[500],
                    },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderComplaintsByStatus = () => {
    if (!data?.complaintsByStatus?.length) return null;

    const statusColors: Record<string, string> = {
      pending: colors.warning[500],
      in_progress: colors.info[500],
      resolved: colors.success[500],
    };

    const total = data.complaintsByStatus.reduce((sum, item) => sum + item.count, 0);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complaints by Status</Text>
        <View style={styles.chartCard}>
          <View style={styles.statusBars}>
            {data.complaintsByStatus.map((item, index) => (
              <View key={index} style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColors[item.status] || colors.gray[400] },
                    ]}
                  />
                  <Text style={styles.statusLabel}>
                    {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
                <View style={styles.statusBarContainer}>
                  <View
                    style={[
                      styles.statusBar,
                      {
                        width: total > 0 ? `${(item.count / total) * 100}%` : '0%',
                        backgroundColor: statusColors[item.status] || colors.gray[400],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.statusCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance</Text>
      <View style={styles.performanceCard}>
        <View style={styles.performanceRow}>
          <View style={styles.performanceItem}>
            {renderCircularProgress(data?.resolutionRate ?? 0)}
            {data?.resolutionTrend !== undefined && (
              <View style={[styles.trendContainer, {
                backgroundColor: data.resolutionTrend >= 0 ? colors.success[50] : colors.error[50],
                marginTop: spacing.sm
              }]}>
                <Ionicons
                  name={data.resolutionTrend >= 0 ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={data.resolutionTrend >= 0 ? colors.success[500] : colors.error[500]}
                />
                <Text style={[styles.trendText, {
                  color: data.resolutionTrend >= 0 ? colors.success[500] : colors.error[500]
                }]}>
                  {data.resolutionTrend >= 0 ? '+' : ''}{data.resolutionTrend}%
                </Text>
              </View>
            )}
          </View>
          <View style={styles.performanceDivider} />
          <View style={styles.performanceItem}>
            <View style={styles.handlingTimeContainer}>
              <Ionicons name="timer-outline" size={32} color={colors.primary[500]} />
              <Text style={styles.performanceValue}>{data?.avgHandlingTime ?? '-'}</Text>
              <Text style={styles.performanceLabel}>Avg Handling Time</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.metricsGrid}>
        <CardSkeleton style={styles.skeletonCard} />
        <CardSkeleton style={styles.skeletonCard} />
        <CardSkeleton style={styles.skeletonCard} />
        <CardSkeleton style={styles.skeletonCard} />
      </View>
      <CardSkeleton style={styles.skeletonChartCard} />
      <CardSkeleton style={styles.skeletonChartCard} />
    </View>
  );

  if (error && !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <EmptyState
          icon="analytics-outline"
          title="Unable to load analytics"
          description={error}
        />
      </SafeAreaView>
    );
  }

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        {renderSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {renderHeader()}
        {renderKeyMetrics()}
        {renderCallsChart()}
        {renderComplaintsByStatus()}
        {renderPerformanceMetrics()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: (Dimensions.get('window').width - spacing.lg * 2 - spacing.md) / 2 - 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...cardShadow,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
    gap: 2,
  },
  trendText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...cardShadow,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
  },
  statusBars: {
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  statusBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  statusBar: {
    height: '100%',
    borderRadius: 4,
  },
  statusCount: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    width: 30,
    textAlign: 'right',
  },
  performanceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...cardShadow,
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  performanceLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
  performanceDivider: {
    width: 1,
    height: 120,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.lg,
  },
  circularContainer: {
    alignItems: 'center',
  },
  circularOuter: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularTrack: {
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgress: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.success[600],
  },
  circularLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
  },
  progressArc: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  handlingTimeContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonCard: {
    width: (Dimensions.get('window').width - spacing.lg * 2 - spacing.md) / 2 - 1,
    height: 120,
  },
  skeletonChartCard: {
    marginTop: spacing.lg,
    height: 160,
  },
});

export default AnalyticsScreen;
