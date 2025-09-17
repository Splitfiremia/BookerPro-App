import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  X,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Target,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  Settings,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics } from "@/providers/AnalyticsProvider";
import AnalyticsChart from "@/components/AnalyticsChart";
import RevenueProjection from "@/components/RevenueProjection";
import ClientDemographics from "@/components/ClientDemographics";
import GoalTracker from "@/components/GoalTracker";
import MetricCard from "@/components/MetricCard";

export default function AdvancedAnalytics() {
  const { user } = useAuth();
  const { getCurrentAnalytics, exportAnalyticsReport } = useAnalytics();
  const [selectedView, setSelectedView] = useState<"overview" | "revenue" | "clients" | "goals">("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  const analytics = useMemo(() => getCurrentAnalytics(), [getCurrentAnalytics]);
  
  // Mock data for advanced analytics
  const mockRevenueProjection = {
    current: 4250,
    projected: 5100,
    growth: 20.0,
    confidence: 85,
    factors: [
      {
        name: "Seasonal Trends",
        impact: 15.2,
        description: "Holiday season typically increases bookings by 15-20%",
      },
      {
        name: "New Services",
        impact: 8.5,
        description: "Recently added hair treatments showing strong demand",
      },
      {
        name: "Client Retention",
        impact: 12.3,
        description: "Improved retention rate leading to more repeat bookings",
      },
    ],
  };
  
  const mockClientDemographics = {
    ageGroups: [
      { range: "18-25", percentage: 25.5, count: 42 },
      { range: "26-35", percentage: 35.2, count: 58 },
      { range: "36-45", percentage: 22.8, count: 38 },
      { range: "46-55", percentage: 12.1, count: 20 },
      { range: "55+", percentage: 4.4, count: 7 },
    ],
    genderDistribution: [
      { gender: "Female", percentage: 68.5, count: 113 },
      { gender: "Male", percentage: 28.2, count: 47 },
      { gender: "Non-binary", percentage: 3.3, count: 5 },
    ],
    locationData: [
      { area: "Downtown", percentage: 45.2, distance: "0-2 miles" },
      { area: "Suburbs", percentage: 32.1, distance: "2-5 miles" },
      { area: "Uptown", percentage: 15.5, distance: "5-10 miles" },
      { area: "Other", percentage: 7.2, distance: "10+ miles" },
    ],
    bookingPatterns: [
      { timeSlot: "9:00-11:00 AM", popularity: 15.2, count: 25 },
      { timeSlot: "11:00 AM-1:00 PM", popularity: 28.5, count: 47 },
      { timeSlot: "1:00-3:00 PM", popularity: 32.1, count: 53 },
      { timeSlot: "3:00-5:00 PM", popularity: 18.8, count: 31 },
      { timeSlot: "5:00-7:00 PM", popularity: 5.4, count: 9 },
    ],
    deviceUsage: [
      { platform: "iOS", percentage: 62.5 },
      { platform: "Android", percentage: 32.1 },
      { platform: "Web", percentage: 5.4 },
    ],
    paymentMethods: [
      { method: "Credit Card", percentage: 55.2, avgAmount: 125 },
      { method: "Apple Pay", percentage: 25.8, avgAmount: 135 },
      { method: "Google Pay", percentage: 12.1, avgAmount: 115 },
      { method: "Cash", percentage: 6.9, avgAmount: 95 },
    ],
  };
  
  const mockGoals = [
    {
      id: "goal-1",
      title: "Monthly Revenue Target",
      target: 6000,
      current: 4250,
      type: "revenue" as const,
      period: "monthly" as const,
      deadline: "2024-12-31",
      description: "Reach $6K monthly revenue",
    },
    {
      id: "goal-2",
      title: "New Client Acquisition",
      target: 25,
      current: 18,
      type: "clients" as const,
      period: "monthly" as const,
      deadline: "2024-12-31",
      description: "Acquire 25 new clients this month",
    },
  ];
  
  const revenueChartData = useMemo(() => {
    return analytics?.earnings.revenueByPeriod.slice(-7).map((item, index) => ({
      label: new Date(item.period).toLocaleDateString('en-US', { weekday: 'short' }),
      value: item.totalRevenue,
      color: index % 2 === 0 ? '#3B82F6' : '#1E40AF',
    })) || [];
  }, [analytics]);
  
  const appointmentsChartData = useMemo(() => {
    return analytics?.metrics.peakHours.map((hour, index) => ({
      label: hour.hour.split(' ')[0],
      value: hour.appointmentCount,
      color: index % 2 === 0 ? '#10B981' : '#059669',
    })) || [];
  }, [analytics]);
  
  const handleExportReport = async () => {
    try {
      await exportAnalyticsReport("monthly");
      if (Platform.OS === 'web') {
        console.log("Analytics report exported successfully!");
      }
    } catch (error) {
      console.error("Failed to export report:", error);
    }
  };
  
  const renderViewSelector = () => (
    <View style={styles.viewSelector}>
      {[
        { key: "overview", label: "Overview", icon: <BarChart3 size={18} color={selectedView === "overview" ? "#FFFFFF" : "#9CA3AF"} /> },
        { key: "revenue", label: "Revenue", icon: <TrendingUp size={18} color={selectedView === "revenue" ? "#FFFFFF" : "#9CA3AF"} /> },
        { key: "clients", label: "Clients", icon: <Users size={18} color={selectedView === "clients" ? "#FFFFFF" : "#9CA3AF"} /> },
        { key: "goals", label: "Goals", icon: <Target size={18} color={selectedView === "goals" ? "#FFFFFF" : "#9CA3AF"} /> },
      ].map((view) => (
        <TouchableOpacity
          key={view.key}
          style={[
            styles.viewButton,
            selectedView === view.key && styles.viewButtonActive,
          ]}
          onPress={() => setSelectedView(view.key as any)}
        >
          {view.icon}
          <Text
            style={[
              styles.viewButtonText,
              selectedView === view.key && styles.viewButtonTextActive,
            ]}
          >
            {view.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[
        { key: "7d", label: "7 Days" },
        { key: "30d", label: "30 Days" },
        { key: "90d", label: "90 Days" },
        { key: "1y", label: "1 Year" },
      ].map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period.key as any)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderOverviewContent = () => {
    if (!analytics) return null;
    
    return (
      <>
        {/* Enhanced Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Revenue"
            value={`${analytics.earnings.totalRevenue.toLocaleString()}`}
            change={analytics.earnings.weekOverWeekGrowth}
            changeLabel="vs last week"
            icon={<TrendingUp size={24} color="#10B981" />}
            color="#10B981"
            animated
            onPress={() => router.push("/earnings-dashboard")}
          />
          
          <MetricCard
            title="Appointments"
            value={analytics.metrics.totalAppointments}
            change={12.5}
            changeLabel="vs last period"
            icon={<Calendar size={24} color="#3B82F6" />}
            color="#3B82F6"
            animated
          />
          
          <MetricCard
            title="New Clients"
            value={analytics.metrics.newClients}
            change={8.2}
            changeLabel="this period"
            icon={<Users size={24} color="#8B5CF6" />}
            color="#8B5CF6"
            animated
          />
          
          <MetricCard
            title="Retention Rate"
            value={`${analytics.metrics.clientRetentionRate}%`}
            change={3.1}
            changeLabel="client loyalty"
            icon={<Target size={24} color="#F59E0B" />}
            color="#F59E0B"
            animated
          />
        </View>
        
        {/* Enhanced Revenue Chart */}
        <AnalyticsChart
          data={revenueChartData}
          type="bar"
          title="Revenue Trend"
          subtitle="Last 7 days"
          currency
          height={250}
          animated
          onExport={handleExportReport}
          onViewDetails={() => console.log('View revenue details')}
        />
        
        {/* Enhanced Appointments Chart */}
        <AnalyticsChart
          data={appointmentsChartData}
          type="bar"
          title="Peak Hours"
          subtitle="Appointments by hour"
          height={200}
          animated
          onExport={handleExportReport}
        />
      </>
    );
  };
  
  const renderRevenueContent = () => (
    <>
      <RevenueProjection
        data={mockRevenueProjection}
        period="monthly"
        onViewDetails={() => console.log("View projection details")}
      />
      
      <AnalyticsChart
        data={revenueChartData}
        type="bar"
        title="Revenue Breakdown"
        subtitle="Service revenue vs tips"
        currency
        height={300}
        animated
        onExport={handleExportReport}
        onViewDetails={() => router.push("/earnings-dashboard")}
      />
    </>
  );
  
  const renderClientsContent = () => (
    <ClientDemographics data={mockClientDemographics} />
  );
  
  const renderGoalsContent = () => (
    <GoalTracker
      goals={mockGoals}
      onAddGoal={(goal) => console.log("Add goal:", goal)}
      onUpdateGoal={(id, updates) => console.log("Update goal:", id, updates)}
      onDeleteGoal={(id) => console.log("Delete goal:", id)}
    />
  );
  
  if (user?.role === "client") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.noAccessText}>Advanced analytics are only available for service providers.</Text>
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
        <Text style={styles.headerTitle}>Advanced Analytics</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.headerButton}>
            <Filter size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExportReport} style={styles.headerButton}>
            <Download size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* View Selector */}
        {renderViewSelector()}
        
        {/* Period Selector */}
        {renderPeriodSelector()}
        
        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filters</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterButton}>
                <MapPin size={16} color="#9CA3AF" />
                <Text style={styles.filterButtonText}>Location</Text>
                <ChevronDown size={16} color="#9CA3AF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.filterButton}>
                <Users size={16} color="#9CA3AF" />
                <Text style={styles.filterButtonText}>Client Type</Text>
                <ChevronDown size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Content based on selected view */}
        {selectedView === "overview" && renderOverviewContent()}
        {selectedView === "revenue" && renderRevenueContent()}
        {selectedView === "clients" && renderClientsContent()}
        {selectedView === "goals" && renderGoalsContent()}
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (Platform.OS === 'web') {
                console.log('Opening detailed analytics report...');
              }
            }}
          >
            <Eye size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>View Detailed Report</Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (Platform.OS === 'web') {
                console.log('Opening analytics settings...');
              }
            }}
          >
            <Settings size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Analytics Settings</Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (Platform.OS === 'web') {
                console.log('Scheduling automated reports...');
              }
            }}
          >
            <Download size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Schedule Reports</Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  viewSelector: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginBottom: 16,
  },
  viewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonActive: {
    backgroundColor: "#3B82F6",
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  viewButtonTextActive: {
    color: "#FFFFFF",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
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
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  filtersContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonText: {
    flex: 1,
    fontSize: 14,
    color: "#9CA3AF",
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
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  quickActions: {
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1,
  },
});