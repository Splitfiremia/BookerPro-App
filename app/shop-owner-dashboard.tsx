import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Building2,
  UserCheck,
  AlertCircle,
  ChevronRight,
  Settings,
  Download,
  Plus,
  Eye,
  BarChart3,
  Target,
  Clock,
  CreditCard,
  MapPin,
  Star,
  Edit3,
  Trash2,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics } from "@/providers/AnalyticsProvider";
import { useShopManagement } from "@/providers/ShopManagementProvider";
import AnalyticsChart from "@/components/AnalyticsChart";

export default function ShopOwnerDashboard() {
  const { user } = useAuth();
  const {
    boothRentStatus,
    updateBoothRentStatus,
    exportAnalyticsReport,
    isLoading: analyticsLoading,
  } = useAnalytics();
  const {
    shops,
    shopMetrics,
    selectedShopId,
    selectedShop,
    selectedShopMetrics,
    consolidatedMetrics,
    setSelectedShopId,
    isLoading: shopLoading,
  } = useShopManagement();
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [viewMode, setViewMode] = useState<"overview" | "individual">("overview");
  
  const isLoading = analyticsLoading || shopLoading;
  
  const overdueRents = useMemo(() => {
    return boothRentStatus.filter(rent => rent.status === "overdue");
  }, [boothRentStatus]);
  
  const revenueChartData = selectedShopMetrics?.revenueByPeriod.map(item => ({
    label: item.period,
    value: item.revenue,
  })) || [];
  
  const shopComparisonData = shopMetrics.map(metrics => {
    const shop = shops.find(s => s.id === metrics.shopId);
    return {
      label: shop?.name.split(' ')[0] || 'Shop',
      value: metrics.totalRevenue,
    };
  });
  
  const handleMarkRentPaid = async (rentId: string) => {
    try {
      await updateBoothRentStatus(rentId, "paid", new Date().toISOString());
      const message = "Booth rent marked as paid successfully!";
      if (Platform.OS === 'web') {
        console.log("Success:", message);
      } else {
        Alert.alert("Success", message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update rent status";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };
  
  const handleExportReport = async () => {
    try {
      await exportAnalyticsReport(selectedPeriod as "daily" | "weekly" | "monthly" | "yearly");
      const message = "Shop analytics report exported successfully!";
      if (Platform.OS === 'web') {
        console.log("Success:", message);
      } else {
        Alert.alert("Success", message);
      }
    } catch (error) {
      const errorMessage = "Failed to export report. Please try again.";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };
  
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "#10B981";
      case "pending": return "#F59E0B";
      case "overdue": return "#EF4444";
      default: return "#6B7280";
    }
  };
  
  if (user?.role !== "owner") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shop Dashboard</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.noAccessText}>Shop owner dashboard is only available for shop owners.</Text>
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
        <Text style={styles.headerTitle}>Shop Owner Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleExportReport} style={styles.headerButton}>
            <Download size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/advanced-analytics")} style={styles.headerButton}>
            <BarChart3 size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* View Mode Toggle */}
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "overview" && styles.viewModeButtonActive]}
            onPress={() => setViewMode("overview")}
          >
            <Text style={[styles.viewModeText, viewMode === "overview" && styles.viewModeTextActive]}>
              All Shops Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "individual" && styles.viewModeButtonActive]}
            onPress={() => setViewMode("individual")}
          >
            <Text style={[styles.viewModeText, viewMode === "individual" && styles.viewModeTextActive]}>
              Individual Shop
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <LinearGradient colors={["#3B82F6", "#1E40AF"]} style={styles.overviewCard}>
            <Building2 size={24} color="#FFFFFF" />
            <Text style={styles.overviewValue}>{shops.length}</Text>
            <Text style={styles.overviewLabel}>Total Shops</Text>
          </LinearGradient>
          
          <LinearGradient colors={["#10B981", "#059669"]} style={styles.overviewCard}>
            <DollarSign size={24} color="#FFFFFF" />
            <Text style={styles.overviewValue}>
              {formatCurrency(viewMode === "overview" ? consolidatedMetrics.totalRevenue : selectedShopMetrics?.totalRevenue || 0)}
            </Text>
            <Text style={styles.overviewLabel}>
              {viewMode === "overview" ? "Total Revenue" : "Shop Revenue"}
            </Text>
          </LinearGradient>
          
          <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={styles.overviewCard}>
            <Users size={24} color="#FFFFFF" />
            <Text style={styles.overviewValue}>
              {viewMode === "overview" ? consolidatedMetrics.stylistCount : selectedShopMetrics?.stylistCount || 0}
            </Text>
            <Text style={styles.overviewLabel}>
              {viewMode === "overview" ? "Total Stylists" : "Shop Stylists"}
            </Text>
          </LinearGradient>
          
          <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.overviewCard}>
            <Calendar size={24} color="#FFFFFF" />
            <Text style={styles.overviewValue}>
              {viewMode === "overview" ? consolidatedMetrics.totalAppointments : selectedShopMetrics?.totalAppointments || 0}
            </Text>
            <Text style={styles.overviewLabel}>
              {viewMode === "overview" ? "Total Appointments" : "Shop Appointments"}
            </Text>
          </LinearGradient>
        </View>
        
        {/* Shop Management Section */}
        <View style={styles.shopManagement}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Shops</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push("/shop-settings/new")}
            >
              <Plus size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopList}>
            {shops.map((shop) => {
              const metrics = shopMetrics.find(m => m.shopId === shop.id);
              const isSelected = selectedShopId === shop.id;
              
              return (
                <TouchableOpacity
                  key={shop.id}
                  style={[
                    styles.shopCard,
                    isSelected && styles.shopCardActive,
                  ]}
                  onPress={() => {
                    setSelectedShopId(shop.id);
                    setViewMode("individual");
                  }}
                >
                  {shop.image && (
                    <Image source={{ uri: shop.image }} style={styles.shopImage} />
                  )}
                  <View style={styles.shopCardContent}>
                    <Text style={[
                      styles.shopName,
                      isSelected && styles.shopNameActive,
                    ]}>
                      {shop.name}
                    </Text>
                    <View style={styles.shopLocation}>
                      <MapPin size={12} color="#9CA3AF" />
                      <Text style={styles.shopLocationText}>
                        {shop.city}, {shop.state}
                      </Text>
                    </View>
                    <View style={styles.shopStats}>
                      <View style={styles.shopStat}>
                        <Star size={12} color="#F59E0B" />
                        <Text style={styles.shopStatText}>
                          {metrics?.averageRating.toFixed(1) || "0.0"}
                        </Text>
                      </View>
                      <Text style={styles.shopStatDivider}>•</Text>
                      <Text style={styles.shopStatText}>
                        {metrics?.stylistCount || 0} stylists
                      </Text>
                      <Text style={styles.shopStatDivider}>•</Text>
                      <Text style={styles.shopStatText}>
                        {formatCurrency(metrics?.monthlyRevenue || 0)}/mo
                      </Text>
                    </View>
                    
                    <View style={styles.shopActions}>
                      <TouchableOpacity 
                        style={styles.shopActionButton}
                        onPress={() => router.push(`/shop-settings/${shop.id}`)}
                      >
                        <Edit3 size={14} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.shopActionButton}
                        onPress={() => router.push("/multi-shop-calendar")}
                      >
                        <Calendar size={14} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.shopActionButton}
                        onPress={() => router.push("/multi-shop-team")}
                      >
                        <Users size={14} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {["weekly", "monthly", "yearly"].map((period) => (
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
        
        {/* Revenue Charts */}
        {viewMode === "individual" && selectedShop && selectedShopMetrics && (
          <AnalyticsChart
            data={revenueChartData}
            type="bar"
            title={`${selectedShop.name} Revenue`}
            subtitle={`${selectedPeriod} performance`}
            currency
            height={250}
          />
        )}
        
        {viewMode === "overview" && shops.length > 1 && (
          <AnalyticsChart
            data={shopComparisonData}
            type="bar"
            title="Shop Performance Comparison"
            subtitle="Revenue by location"
            currency
            height={200}
          />
        )}
        
        {/* Team Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Management</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push("/multi-shop-team")}
            >
              <Users size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Team Overview Cards */}
          <View style={styles.teamOverviewGrid}>
            <View style={styles.teamOverviewCard}>
              <View style={styles.teamOverviewHeader}>
                <Users size={20} color="#3B82F6" />
                <Text style={styles.teamOverviewValue}>
                  {consolidatedMetrics.stylistCount}
                </Text>
              </View>
              <Text style={styles.teamOverviewLabel}>Total Stylists</Text>
              <View style={styles.teamOverviewMeta}>
                <View style={styles.teamOverviewStatus}>
                  <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
                  <Text style={styles.teamOverviewStatusText}>12 available</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.teamOverviewCard}>
              <View style={styles.teamOverviewHeader}>
                <DollarSign size={20} color="#10B981" />
                <Text style={styles.teamOverviewValue}>
                  {formatCurrency(45000)}
                </Text>
              </View>
              <Text style={styles.teamOverviewLabel}>Team Revenue</Text>
              <View style={styles.teamOverviewMeta}>
                <TrendingUp size={12} color="#10B981" />
                <Text style={styles.teamOverviewTrend}>+12% this month</Text>
              </View>
            </View>
            
            <View style={styles.teamOverviewCard}>
              <View style={styles.teamOverviewHeader}>
                <AlertCircle size={20} color="#F59E0B" />
                <Text style={styles.teamOverviewValue}>3</Text>
              </View>
              <Text style={styles.teamOverviewLabel}>Pending Rents</Text>
              <View style={styles.teamOverviewMeta}>
                <Text style={styles.teamOverviewAmount}>{formatCurrency(2400)} due</Text>
              </View>
            </View>
            
            <View style={styles.teamOverviewCard}>
              <View style={styles.teamOverviewHeader}>
                <Star size={20} color="#F59E0B" />
                <Text style={styles.teamOverviewValue}>4.7</Text>
              </View>
              <Text style={styles.teamOverviewLabel}>Avg Rating</Text>
              <View style={styles.teamOverviewMeta}>
                <Text style={styles.teamOverviewReviews}>Based on 234 reviews</Text>
              </View>
            </View>
          </View>
          
          {/* Quick Team Actions */}
          <View style={styles.teamQuickActions}>
            <TouchableOpacity 
              style={styles.teamActionButton}
              onPress={() => router.push("/multi-shop-team")}
            >
              <Users size={16} color="#3B82F6" />
              <Text style={styles.teamActionText}>Manage All Teams</Text>
              <ChevronRight size={16} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.teamActionButton}>
              <Calendar size={16} color="#10B981" />
              <Text style={styles.teamActionText}>Team Schedules</Text>
              <ChevronRight size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Booth Rent Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Booth Rent System</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push("/booth-rent-dashboard")}
            >
              <CreditCard size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Rent Overview Cards */}
          <View style={styles.rentOverviewGrid}>
            <View style={styles.rentOverviewCard}>
              <View style={styles.rentOverviewHeader}>
                <DollarSign size={20} color="#10B981" />
                <Text style={styles.rentOverviewValue}>
                  {formatCurrency(boothRentStatus.reduce((sum, rent) => sum + rent.amount, 0))}
                </Text>
              </View>
              <Text style={styles.rentOverviewLabel}>Total Monthly Rent</Text>
              <View style={styles.rentOverviewMeta}>
                <TrendingUp size={12} color="#10B981" />
                <Text style={styles.rentOverviewTrend}>+8% this month</Text>
              </View>
            </View>
            
            <View style={styles.rentOverviewCard}>
              <View style={styles.rentOverviewHeader}>
                <Clock size={20} color="#F59E0B" />
                <Text style={styles.rentOverviewValue}>
                  {boothRentStatus.filter(rent => rent.status === "pending").length}
                </Text>
              </View>
              <Text style={styles.rentOverviewLabel}>Pending Payments</Text>
              <View style={styles.rentOverviewMeta}>
                <Text style={styles.rentOverviewAmount}>
                  {formatCurrency(boothRentStatus.filter(rent => rent.status === "pending").reduce((sum, rent) => sum + rent.amount, 0))}
                </Text>
              </View>
            </View>
            
            <View style={styles.rentOverviewCard}>
              <View style={styles.rentOverviewHeader}>
                <AlertCircle size={20} color="#EF4444" />
                <Text style={styles.rentOverviewValue}>
                  {overdueRents.length}
                </Text>
              </View>
              <Text style={styles.rentOverviewLabel}>Overdue Rents</Text>
              <View style={styles.rentOverviewMeta}>
                <Text style={styles.rentOverviewOverdue}>
                  {formatCurrency(overdueRents.reduce((sum, rent) => sum + rent.amount, 0))}
                </Text>
              </View>
            </View>
            
            <View style={styles.rentOverviewCard}>
              <View style={styles.rentOverviewHeader}>
                <UserCheck size={20} color="#3B82F6" />
                <Text style={styles.rentOverviewValue}>
                  {Math.round((boothRentStatus.filter(rent => rent.status === "paid").length / boothRentStatus.length) * 100) || 0}%
                </Text>
              </View>
              <Text style={styles.rentOverviewLabel}>Collection Rate</Text>
              <View style={styles.rentOverviewMeta}>
                <Text style={styles.rentOverviewCollection}>This month</Text>
              </View>
            </View>
          </View>
          
          {/* Automated Rent Calculation */}
          <View style={styles.automatedRentSection}>
            <View style={styles.automatedRentHeader}>
              <View style={styles.automatedRentIcon}>
                <Settings size={16} color="#3B82F6" />
              </View>
              <View style={styles.automatedRentContent}>
                <Text style={styles.automatedRentTitle}>Automated Rent Calculation</Text>
                <Text style={styles.automatedRentDescription}>
                  System automatically calculates rent based on revenue percentage or fixed amounts
                </Text>
              </View>
              <TouchableOpacity style={styles.automatedRentToggle}>
                <View style={[styles.toggleSwitch, styles.toggleSwitchActive]}>
                  <View style={styles.toggleKnob} />
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.automatedRentStats}>
              <View style={styles.automatedRentStat}>
                <Text style={styles.automatedRentStatLabel}>Revenue-based</Text>
                <Text style={styles.automatedRentStatValue}>15-25%</Text>
              </View>
              <View style={styles.automatedRentStat}>
                <Text style={styles.automatedRentStatLabel}>Fixed Rate</Text>
                <Text style={styles.automatedRentStatValue}>$800-1200</Text>
              </View>
              <View style={styles.automatedRentStat}>
                <Text style={styles.automatedRentStatLabel}>Auto-deduct</Text>
                <Text style={styles.automatedRentStatValue}>3 stylists</Text>
              </View>
            </View>
          </View>
          
          {/* Payment Reminders */}
          <View style={styles.paymentRemindersSection}>
            <View style={styles.paymentRemindersHeader}>
              <View style={styles.paymentRemindersIcon}>
                <AlertCircle size={16} color="#F59E0B" />
              </View>
              <View style={styles.paymentRemindersContent}>
                <Text style={styles.paymentRemindersTitle}>Payment Reminders & Notifications</Text>
                <Text style={styles.paymentRemindersDescription}>
                  Automated reminders sent 7, 3, and 1 day before due date
                </Text>
              </View>
            </View>
            
            <View style={styles.remindersList}>
              <View style={styles.reminderItem}>
                <View style={styles.reminderStatus}>
                  <View style={[styles.reminderDot, { backgroundColor: "#10B981" }]} />
                </View>
                <View style={styles.reminderDetails}>
                  <Text style={styles.reminderText}>12 reminders sent today</Text>
                  <Text style={styles.reminderTime}>Last sent: 2 hours ago</Text>
                </View>
              </View>
              
              <View style={styles.reminderItem}>
                <View style={styles.reminderStatus}>
                  <View style={[styles.reminderDot, { backgroundColor: "#F59E0B" }]} />
                </View>
                <View style={styles.reminderDetails}>
                  <Text style={styles.reminderText}>3 overdue notifications</Text>
                  <Text style={styles.reminderTime}>Escalation pending</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Overdue Rents Alert */}
          {overdueRents.length > 0 && (
            <View style={styles.alertCard}>
              <AlertCircle size={20} color="#EF4444" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {overdueRents.length} Overdue Rent{overdueRents.length > 1 ? 's' : ''}
                </Text>
                <Text style={styles.alertDescription}>
                  Total overdue: {formatCurrency(overdueRents.reduce((sum, rent) => sum + rent.amount, 0))}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.alertAction}
                onPress={() => router.push("/booth-rent-dashboard")}
              >
                <Text style={styles.alertActionText}>Review</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Recent Rent Activity */}
          <View style={styles.rentActivitySection}>
            <Text style={styles.rentActivityTitle}>Recent Rent Activity</Text>
            <View style={styles.rentList}>
              {boothRentStatus.slice(0, 3).map((rent) => {
                const daysUntilDue = Math.ceil((new Date(rent.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
                
                return (
                  <View key={rent.id} style={styles.rentItem}>
                    <View style={styles.rentItemLeft}>
                      <View style={[
                        styles.rentItemAvatar,
                        { backgroundColor: getStatusColor(rent.status) }
                      ]}>
                        <Text style={styles.rentItemAvatarText}>
                          {rent.stylistName.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.rentItemDetails}>
                        <Text style={styles.rentItemName}>{rent.stylistName}</Text>
                        <Text style={styles.rentItemShop}>{rent.shopName}</Text>
                        <View style={styles.rentItemDueDateContainer}>
                          <Clock size={12} color={isOverdue ? "#EF4444" : isDueSoon ? "#F59E0B" : "#6B7280"} />
                          <Text style={[
                            styles.rentItemDate,
                            { color: isOverdue ? "#EF4444" : isDueSoon ? "#F59E0B" : "#6B7280" }
                          ]}>
                            {isOverdue 
                              ? `Overdue by ${Math.abs(daysUntilDue)} days`
                              : isDueSoon 
                                ? `Due in ${daysUntilDue} days`
                                : formatDate(rent.dueDate)
                            }
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.rentItemRight}>
                      <Text style={styles.rentItemAmount}>{formatCurrency(rent.amount)}</Text>
                      <View style={[styles.rentStatus, { backgroundColor: getStatusColor(rent.status) }]}>
                        <Text style={styles.rentStatusText}>{rent.status}</Text>
                      </View>
                      
                      {rent.status === "pending" && (
                        <TouchableOpacity
                          style={styles.markPaidButton}
                          onPress={() => handleMarkRentPaid(rent.id)}
                        >
                          <UserCheck size={16} color="#10B981" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push("/booth-rent-dashboard")}
          >
            <Text style={styles.viewAllText}>View Full Booth Rent Dashboard</Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        {/* Performance Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {viewMode === "overview" ? "Overall Performance" : "Shop Performance"}
            </Text>
            <TouchableOpacity onPress={() => router.push("/advanced-analytics")}>
              <Eye size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.performanceValue}>
                {viewMode === "overview" 
                  ? consolidatedMetrics.averageRating.toFixed(1)
                  : selectedShopMetrics?.averageRating.toFixed(1) || "0.0"
                }
              </Text>
              <Text style={styles.performanceLabel}>Avg Rating</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <Target size={20} color="#3B82F6" />
              <Text style={styles.performanceValue}>
                {viewMode === "overview" 
                  ? Math.round(shopMetrics.reduce((sum, m) => sum + m.chairUtilizationRate, 0) / (shopMetrics.length || 1))
                  : selectedShopMetrics?.chairUtilizationRate || 0
                }%
              </Text>
              <Text style={styles.performanceLabel}>Utilization</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <Calendar size={20} color="#F59E0B" />
              <Text style={styles.performanceValue}>
                {viewMode === "overview" 
                  ? consolidatedMetrics.monthlyAppointments
                  : selectedShopMetrics?.monthlyAppointments || 0
                }
              </Text>
              <Text style={styles.performanceLabel}>Monthly Appts</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <CreditCard size={20} color="#8B5CF6" />
              <Text style={styles.performanceValue}>
                {formatCurrency(viewMode === "overview" 
                  ? consolidatedMetrics.averageTicketSize
                  : selectedShopMetrics?.averageTicketSize || 0
                )}
              </Text>
              <Text style={styles.performanceLabel}>Avg Ticket</Text>
            </View>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/multi-shop-team")}
          >
            <Users size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Manage All Teams</Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/shop-settings/new")}
          >
            <Plus size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Add New Shop</Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/multi-shop-calendar")}
          >
            <Calendar size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Unified Calendar</Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/advanced-analytics")}
          >
            <BarChart3 size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Advanced Analytics</Text>
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
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginTop: 20,
    marginBottom: 24,
  },
  overviewCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  shopSelector: {
    marginBottom: 24,
  },
  shopList: {
    marginTop: 12,
  },
  shopCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 150,
  },
  shopCardActive: {
    backgroundColor: "#3B82F6",
  },
  shopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  shopNameActive: {
    color: "#FFFFFF",
  },
  shopStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  alertAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EF4444",
    borderRadius: 6,
  },
  alertActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  rentList: {
    gap: 12,
  },
  rentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  rentItemLeft: {
    flex: 1,
  },
  rentItemDetails: {
    flex: 1,
  },
  rentItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  rentItemShop: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  rentItemDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  rentItemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  rentItemAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  rentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rentStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  markPaidButton: {
    padding: 4,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 16,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: "#6B7280",
  },
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  performanceCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
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
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
    marginTop: 20,
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  viewModeButtonActive: {
    backgroundColor: "#374151",
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  viewModeTextActive: {
    color: "#FFFFFF",
  },
  shopManagement: {
    marginBottom: 24,
  },
  shopImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    marginBottom: 12,
  },
  shopCardContent: {
    flex: 1,
  },
  shopLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  shopLocationText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  shopStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  shopStatText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  shopStatDivider: {
    fontSize: 12,
    color: "#6B7280",
    marginHorizontal: 4,
  },
  shopActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  shopActionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#374151",
  },
  teamOverviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 16,
  },
  teamOverviewCard: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  teamOverviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  teamOverviewValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  teamOverviewLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  teamOverviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 4,
  },
  teamOverviewStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  teamOverviewStatusText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  teamOverviewTrend: {
    fontSize: 11,
    color: "#10B981",
    marginLeft: 4,
  },
  teamOverviewAmount: {
    fontSize: 11,
    color: "#F59E0B",
  },
  teamOverviewReviews: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  teamQuickActions: {
    flexDirection: "row",
    gap: 12,
  },
  teamActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  teamActionText: {
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
  },
  // Booth Rent System Styles
  rentOverviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 20,
  },
  rentOverviewCard: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  rentOverviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  rentOverviewValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  rentOverviewLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  rentOverviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 4,
  },
  rentOverviewTrend: {
    fontSize: 11,
    color: "#10B981",
    marginLeft: 4,
  },
  rentOverviewAmount: {
    fontSize: 11,
    color: "#F59E0B",
  },
  rentOverviewOverdue: {
    fontSize: 11,
    color: "#EF4444",
  },
  rentOverviewCollection: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  automatedRentSection: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  automatedRentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  automatedRentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  automatedRentContent: {
    flex: 1,
  },
  automatedRentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  automatedRentDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 16,
  },
  automatedRentToggle: {
    padding: 4,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#374151",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#3B82F6",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-end",
  },
  automatedRentStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  automatedRentStat: {
    alignItems: "center",
  },
  automatedRentStatLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  automatedRentStatValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  paymentRemindersSection: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentRemindersHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  paymentRemindersIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRemindersContent: {
    flex: 1,
  },
  paymentRemindersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  paymentRemindersDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 16,
  },
  remindersList: {
    gap: 8,
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reminderStatus: {
    alignItems: "center",
    justifyContent: "center",
  },
  reminderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderText: {
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  rentActivitySection: {
    marginTop: 16,
  },
  rentActivityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  rentItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rentItemAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  rentItemDueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});