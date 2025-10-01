import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import { usePerformanceMetrics, usePerformanceValidation } from '@/hooks/usePerformanceValidation';

export default function PerformanceDebugScreen() {
  const insets = useSafeAreaInsets();
  const { startup, providers, exportMetrics, clear } = usePerformanceMetrics();
  const { result, revalidate } = usePerformanceValidation();

  const handleExport = async () => {
    try {
      const metricsJson = exportMetrics();
      await Share.share({
        message: metricsJson,
        title: 'Performance Metrics',
      });
    } catch (error) {
      console.error('Failed to export metrics:', error);
    }
  };

  const getStatusColor = (time: number, thresholds: { good: number; warning: number }) => {
    if (time < thresholds.good) return COLORS.success;
    if (time < thresholds.warning) return COLORS.warning;
    return COLORS.error;
  };

  const getStatusEmoji = (time: number, thresholds: { good: number; warning: number }) => {
    if (time < thresholds.good) return '✅';
    if (time < thresholds.warning) return '⚠️';
    return '🐌';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Performance Debug',
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Startup Metrics</Text>
          
          {startup.essentialsLoaded && (
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>
                {getStatusEmoji(startup.essentialsLoaded - startup.appStart, { good: 100, warning: 200 })}
                {' '}Essentials Loaded
              </Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: getStatusColor(startup.essentialsLoaded - startup.appStart, { good: 100, warning: 200 }) },
                ]}
              >
                {(startup.essentialsLoaded - startup.appStart).toFixed(2)}ms
              </Text>
            </View>
          )}

          {startup.coreLoaded && (
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>
                {getStatusEmoji(startup.coreLoaded - startup.appStart, { good: 300, warning: 500 })}
                {' '}Core Loaded
              </Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: getStatusColor(startup.coreLoaded - startup.appStart, { good: 300, warning: 500 }) },
                ]}
              >
                {(startup.coreLoaded - startup.appStart).toFixed(2)}ms
              </Text>
            </View>
          )}

          {startup.featuresLoaded && (
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>
                {getStatusEmoji(startup.featuresLoaded - startup.appStart, { good: 1000, warning: 2000 })}
                {' '}Features Loaded
              </Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: getStatusColor(startup.featuresLoaded - startup.appStart, { good: 1000, warning: 2000 }) },
                ]}
              >
                {(startup.featuresLoaded - startup.appStart).toFixed(2)}ms
              </Text>
            </View>
          )}

          {startup.totalStartupTime && (
            <View style={[styles.metricRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>
                {getStatusEmoji(startup.totalStartupTime, { good: 1500, warning: 3000 })}
                {' '}Total Startup Time
              </Text>
              <Text
                style={[
                  styles.totalValue,
                  { color: getStatusColor(startup.totalStartupTime, { good: 1500, warning: 3000 }) },
                ]}
              >
                {startup.totalStartupTime.toFixed(2)}ms
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Provider Breakdown</Text>
          
          {['essential', 'core', 'feature'].map((tier) => {
            const tierProviders = providers.filter((p) => p.tier === tier);
            if (tierProviders.length === 0) return null;

            const totalTime = tierProviders.reduce((sum, p) => sum + p.loadTime, 0);
            const avgTime = totalTime / tierProviders.length;

            return (
              <View key={tier} style={styles.tierSection}>
                <Text style={styles.tierTitle}>
                  {tier.toUpperCase()} ({tierProviders.length} providers)
                </Text>
                <Text style={styles.tierStats}>
                  Total: {totalTime.toFixed(2)}ms | Avg: {avgTime.toFixed(2)}ms
                </Text>
                
                {tierProviders.map((provider) => (
                  <View key={provider.name} style={styles.providerRow}>
                    <Text style={styles.providerName}>
                      {provider.loadTime > 500 ? '🐌' : provider.loadTime > 200 ? '⚠️' : '⚡'}
                      {' '}{provider.name}
                    </Text>
                    <Text
                      style={[
                        styles.providerTime,
                        { color: getStatusColor(provider.loadTime, { good: 100, warning: 300 }) },
                      ]}
                    >
                      {provider.loadTime.toFixed(2)}ms
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {result.isValid ? '✅' : '❌'} Validation Results
            </Text>

            {result.errors.length > 0 && (
              <View style={styles.validationSection}>
                <Text style={styles.validationTitle}>Errors:</Text>
                {result.errors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            {result.warnings.length > 0 && (
              <View style={styles.validationSection}>
                <Text style={styles.validationTitle}>Warnings:</Text>
                {result.warnings.map((warning, index) => (
                  <Text key={index} style={styles.warningText}>
                    • {warning}
                  </Text>
                ))}
              </View>
            )}

            {result.recommendations.length > 0 && (
              <View style={styles.validationSection}>
                <Text style={styles.validationTitle}>Recommendations:</Text>
                {result.recommendations.map((rec, index) => (
                  <Text key={index} style={styles.recommendationText}>
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={revalidate}>
            <Text style={styles.buttonText}>🔄 Revalidate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleExport}>
            <Text style={styles.buttonText}>📤 Export Metrics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clear}>
            <Text style={styles.buttonText}>🗑️ Clear Metrics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricLabel: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.lightGray,
  },
  metricValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
  },
  tierSection: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tierTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  tierStats: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.lightGray,
    marginBottom: SPACING.sm,
  },
  providerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  providerName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
  },
  providerTime: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
  },
  validationSection: {
    marginTop: SPACING.md,
  },
  validationTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  recommendationText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.info,
    marginBottom: SPACING.xs,
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
