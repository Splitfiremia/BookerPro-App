import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, BarChart2, Users, DollarSign, TrendingUp } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

export default function ShopOwnerDashboard() {
  const router = useRouter();

  const metrics = [
    { label: "Today's Revenue", value: "$2,450", icon: DollarSign, change: "+15%", color: "#4CAF50" },
    { label: "Total Appointments", value: "47", icon: Calendar, change: "+8%", color: "#2196F3" },
    { label: "Active Providers", value: "12", icon: Users, change: "+2%", color: "#FF9800" },
    { label: "Peak Hours", value: "2-4 PM", icon: TrendingUp, change: "Busy", color: "#9C27B0" },
  ];

  const quickActions = [
    {
      title: "View Aggregated Calendar",
      subtitle: "All providers' appointments",
      icon: Calendar,
      onPress: () => router.push("/calendar"),
    },
    {
      title: "Business Analytics",
      subtitle: "Performance insights",
      icon: BarChart2,
      onPress: () => router.push("/analytics"),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        <Text style={styles.sectionTitle}>Today's Overview</Text>
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
          { text: "New appointment confirmed - Sarah with Mike", time: "5 min ago" },
          { text: "Payment processed - $85 haircut service", time: "12 min ago" },
          { text: "Provider availability updated - Emma", time: "25 min ago" },
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: "bold",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 8,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
    textAlign: "center",
  },
  overviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: COLORS.secondary,
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
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
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
});