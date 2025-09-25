import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, BarChart2, Users, DollarSign, TrendingUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function ShopOwnerDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const metrics = [
    { label: 'Today\'s Revenue', value: '$2,450', icon: DollarSign, change: '+15%', color: '#4CAF50' },
    { label: 'Total Appointments', value: '47', icon: Calendar, change: '+8%', color: '#2196F3' },
    { label: 'Active Providers', value: '12', icon: Users, change: '+2%', color: '#FF9800' },
    { label: 'Peak Hours', value: '2-4 PM', icon: TrendingUp, change: 'Busy', color: '#9C27B0' },
  ];

  const quickActions = [
    {
      title: 'View Aggregated Calendar',
      subtitle: 'All providers\' appointments',
      icon: Calendar,
      onPress: () => router.push('/calendar'),
    },
    {
      title: 'Business Analytics',
      subtitle: 'Performance insights',
      icon: BarChart2,
      onPress: () => router.push('/analytics'),
    },
  ];

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop Owner Dashboard</Text>
        <Text style={styles.headerSubtitle}>Oversight & Business Intelligence</Text>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <View key={index} style={styles.metricCard} testID={`metric-${index}`}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${metric.color}20` }]}>
                  <Icon size={20} color={metric.color} />
                </View>
                <Text style={[styles.metricChange, { color: metric.color }]}>{metric.change}</Text>
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                testID={`action-${index}`}
              >
                <Icon size={24} color={COLORS.primary} />
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today&apos;s Overview</Text>
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Appointments Completed</Text>
            <Text style={styles.overviewValue}>32 / 47</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Provider Capacity</Text>
            <Text style={styles.overviewValue}>85%</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Revenue Target</Text>
            <Text style={styles.overviewValue}>$2,450 / $3,000</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {[
          { text: 'New appointment confirmed - Sarah with Mike', time: '5 min ago' },
          { text: 'Payment processed - $85 haircut service', time: '12 min ago' },
          { text: 'Provider availability updated - Emma', time: '25 min ago' },
        ].map((item, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{item.text}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    ...GLASS_STYLES.card,
    padding: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.lightGray,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    width: "48%",
    ...GLASS_STYLES.card,
    padding: 16,
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  metricChange: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: FONTS.bold,
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    ...GLASS_STYLES.card,
    padding: 16,
    alignItems: "center",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center' as const,
    fontFamily: FONTS.bold,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 4,
    textAlign: 'center' as const,
    fontFamily: FONTS.regular,
  },
  overviewCard: {
    ...GLASS_STYLES.card,
    padding: 16,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  overviewLabel: {
    fontSize: 14,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  activityItem: {
    ...GLASS_STYLES.card,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    padding: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 12,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
});