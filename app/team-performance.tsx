import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import {
  X,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Target,
  Award,
  Zap,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/providers/AuthProvider";
import { useTeam } from "@/providers/TeamProvider";
import { useShopManagement } from "@/providers/ShopManagementProvider";

const { width } = Dimensions.get("window");

export default function TeamPerformanceDashboard() {
  const { user } = useAuth();
  const { teamMembers } = useTeam();
  const { shops } = useShopManagement();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter">("month");
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "appointments" | "rating">("revenue");

  const performanceData = useMemo(() => {
    const topPerformers = teamMembers
      .filter(m => m.role === "stylist")
      .sort((a, b) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0))
      .slice(0, 5);

    const totalRevenue = teamMembers.reduce((sum, m) => sum + (m.monthlyRevenue || 0), 0);
    const avgRating = teamMembers.length > 0 
      ? teamMembers.reduce((sum, m) => sum + (m.rating || 0), 0) / teamMembers.length 
      : 0;
    const totalAppointments = teamMembers.reduce((sum, m) => sum + (m.appointmentsToday || 0), 0);

    const shopPerformance = shops.map(shop => {
      const shopTeam = teamMembers.filter(m => m.shopId === shop.id);
      const shopRevenue = shopTeam.reduce((sum, m) => sum + (m.monthlyRevenue || 0), 0);
      const shopRating = shopTeam.length > 0 
        ? shopTeam.reduce((sum, m) => sum + (m.rating || 0), 0) / shopTeam.length 
        : 0;
      
      return {
        shop,
        teamCount: shopTeam.length,
        revenue: shopRevenue,
        rating: shopRating,
        appointments: shopTeam.reduce((sum, m) => sum + (m.appointmentsToday || 0), 0),
      };
    });

    return {
      topPerformers,
      totalRevenue,
      avgRating,
      totalAppointments,
      shopPerformance,
    };
  }, [teamMembers, shops]);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  if (user?.role !== "owner") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Team Performance</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.noAccessText}>Team performance dashboard is only available for shop owners.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Performance</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push("/multi-shop-team")}
        >
          <Users size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {["week", "month", "quarter"].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period as any)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <LinearGradient colors={["#10B981", "#059669"]} style={styles.metricCard}>
            <DollarSign size={24} color="#FFFFFF" />
            <Text style={styles.metricValue}>{formatCurrency(performanceData.totalRevenue)}</Text>
            <Text style={styles.metricLabel}>Team Revenue</Text>
            <View style={styles.metricTrend}>
              <TrendingUp size={12} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.metricTrendText}>+15% vs last month</Text>
            </View>
          </LinearGradient>

          <LinearGradient colors={["#3B82F6", "#1E40AF"]} style={styles.metricCard}>
            <Calendar size={24} color="#FFFFFF" />
            <Text style={styles.metricValue}>{performanceData.totalAppointments}</Text>
            <Text style={styles.metricLabel}>Today's Appointments</Text>
            <View style={styles.metricTrend}>
              <Target size={12} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.metricTrendText}>85% capacity</Text>
            </View>
          </LinearGradient>

          <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.metricCard}>
            <Star size={24} color="#FFFFFF" />
            <Text style={styles.metricValue}>{performanceData.avgRating.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Average Rating</Text>
            <View style={styles.metricTrend}>
              <Award size={12} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.metricTrendText}>Top 10% in area</Text>
            </View>
          </LinearGradient>

          <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={styles.metricCard}>
            <Zap size={24} color="#FFFFFF" />
            <Text style={styles.metricValue}>92%</Text>
            <Text style={styles.metricLabel}>Team Efficiency</Text>
            <View style={styles.metricTrend}>
              <CheckCircle size={12} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.metricTrendText}>Above target</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Performers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.performersList}>
            {performanceData.topPerformers.map((performer, index) => {
              const shop = shops.find(s => s.id === performer.shopId);
              return (
                <View key={performer.id} style={styles.performerCard}>
                  <View style={styles.performerRank}>
                    <Text style={styles.performerRankText}>#{index + 1}</Text>
                  </View>
                  
                  <View style={styles.performerInfo}>
                    {performer.image && (
                      <Image source={{ uri: performer.image }} style={styles.performerAvatar} />
                    )}
                    <View style={styles.performerDetails}>
                      <Text style={styles.performerName}>{performer.name}</Text>
                      <Text style={styles.performerShop}>{shop?.name}</Text>
                      <View style={styles.performerStats}>
                        <View style={styles.performerStat}>
                          <Star size={12} color="#F59E0B" />
                          <Text style={styles.performerStatText}>
                            {performer.rating?.toFixed(1) || "0.0"}
                          </Text>
                        </View>
                        <Text style={styles.performerStatDivider}>•</Text>
                        <Text style={styles.performerStatText}>
                          {performer.appointmentsToday || 0} appts
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.performerMetrics}>
                    <Text style={styles.performerRevenue}>
                      {formatCurrency(performer.monthlyRevenue || 0)}
                    </Text>
                    <Text style={styles.performerRevenueLabel}>This month</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Shop Performance Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Performance Comparison</Text>
          
          <View style={styles.shopComparisonList}>
            {performanceData.shopPerformance.map((shopData) => (
              <View key={shopData.shop.id} style={styles.shopComparisonCard}>
                <View style={styles.shopComparisonHeader}>
                  <Text style={styles.shopComparisonName}>{shopData.shop.name}</Text>
                  <View style={styles.shopComparisonTeamCount}>
                    <Users size={12} color="#9CA3AF" />
                    <Text style={styles.shopComparisonTeamText}>
                      {shopData.teamCount} team members
                    </Text>
                  </View>
                </View>
                
                <View style={styles.shopComparisonMetrics}>
                  <View style={styles.shopComparisonMetric}>
                    <DollarSign size={14} color="#10B981" />
                    <Text style={styles.shopComparisonMetricValue}>
                      {formatCurrency(shopData.revenue)}
                    </Text>
                    <Text style={styles.shopComparisonMetricLabel}>Revenue</Text>
                  </View>
                  
                  <View style={styles.shopComparisonMetric}>
                    <Star size={14} color="#F59E0B" />
                    <Text style={styles.shopComparisonMetricValue}>
                      {shopData.rating.toFixed(1)}
                    </Text>
                    <Text style={styles.shopComparisonMetricLabel}>Rating</Text>
                  </View>
                  
                  <View style={styles.shopComparisonMetric}>
                    <Calendar size={14} color="#3B82F6" />
                    <Text style={styles.shopComparisonMetricValue}>
                      {shopData.appointments}
                    </Text>
                    <Text style={styles.shopComparisonMetricLabel}>Today</Text>
                  </View>
                </View>
                
                {/* Performance Bar */}
                <View style={styles.performanceBar}>
                  <View style={styles.performanceBarTrack}>
                    <View 
                      style={[
                        styles.performanceBarFill,
                        { 
                          width: `${Math.min((shopData.revenue / Math.max(...performanceData.shopPerformance.map(s => s.revenue))) * 100, 100)}%`,
                          backgroundColor: "#3B82F6",
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.performanceBarLabel}>
                    {Math.round((shopData.revenue / Math.max(...performanceData.shopPerformance.map(s => s.revenue))) * 100)}% of top
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Team Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Insights</Text>
          
          <View style={styles.insightsGrid}>
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Clock size={20} color="#3B82F6" />
                <Text style={styles.insightTitle}>Peak Hours</Text>
              </View>
              <Text style={styles.insightValue}>2-4 PM</Text>
              <Text style={styles.insightDescription}>
                Highest booking volume across all shops
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Target size={20} color="#10B981" />
                <Text style={styles.insightTitle}>Utilization</Text>
              </View>
              <Text style={styles.insightValue}>78%</Text>
              <Text style={styles.insightDescription}>
                Average chair utilization rate
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Users size={20} color="#F59E0B" />
                <Text style={styles.insightTitle}>Retention</Text>
              </View>
              <Text style={styles.insightValue}>85%</Text>
              <Text style={styles.insightDescription}>
                Client retention rate this quarter
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Award size={20} color="#8B5CF6" />
                <Text style={styles.insightTitle}>Growth</Text>
              </View>
              <Text style={styles.insightValue}>+23%</Text>
              <Text style={styles.insightDescription}>
                Revenue growth vs last quarter
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noAccessText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
    marginTop: 20,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#374151",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginBottom: 24,
  },
  metricCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  metricTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricTrendText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  viewAllText: {
    fontSize: 14,
    color: "#3B82F6",
  },
  performersList: {
    gap: 12,
  },
  performerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  performerRankText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  performerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  performerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  performerDetails: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  performerShop: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  performerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  performerStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  performerStatText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  performerStatDivider: {
    fontSize: 12,
    color: "#6B7280",
    marginHorizontal: 4,
  },
  performerMetrics: {
    alignItems: "flex-end",
  },
  performerRevenue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 2,
  },
  performerRevenueLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  shopComparisonList: {
    gap: 16,
  },
  shopComparisonCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  shopComparisonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  shopComparisonName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  shopComparisonTeamCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shopComparisonTeamText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  shopComparisonMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  shopComparisonMetric: {
    alignItems: "center",
    gap: 4,
  },
  shopComparisonMetricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  shopComparisonMetricLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  performanceBar: {
    marginTop: 8,
  },
  performanceBarTrack: {
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    marginBottom: 4,
  },
  performanceBarFill: {
    height: 4,
    borderRadius: 2,
  },
  performanceBarLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  insightCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  insightValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  insightDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    paddingHorizontal: 12,
    lineHeight: 16,
  },
});