import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';

export default function ShopOwnerOnboardingStart() {
  const router = useRouter();
  const { resetOnboarding } = useShopOwnerOnboarding();
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    // Reset the onboarding state to ensure a fresh start
    resetOnboarding();
    // Navigate to the first step
    router.push('/shop-owner-onboarding/shop-information' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.background}
      >
        <View style={[
          styles.content,
          {
            paddingTop: 24 + insets.top,
            paddingBottom: 24 + insets.bottom
          }
        ]}>
          <View style={styles.header}>
            <Text style={styles.title}>Set Up Your Shop</Text>
            <Text style={styles.subtitle}>
              Let&apos;s get your business ready to accept bookings
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoNumber}>1</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Business Details</Text>
                <Text style={styles.infoDescription}>
                  Tell us about your shop and services
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoNumber}>2</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Service Menu</Text>
                <Text style={styles.infoDescription}>
                  Set up your services and pricing
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoNumber}>3</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Team Management</Text>
                <Text style={styles.infoDescription}>
                  Invite your providers to join
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleStart}
            activeOpacity={0.8}
            testID="start-shop-onboarding-button"
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: '80%',
  },
  infoContainer: {
    marginVertical: 40,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b5998',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
});