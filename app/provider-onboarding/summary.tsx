import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useProviderOnboarding, ProviderService, TimeSlot } from '@/providers/ProviderOnboardingProvider';
import { Clock, DollarSign, User, Briefcase } from 'lucide-react-native';

export default function SummaryScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps,
    providerType,
    firstName,
    lastName,
    workSituation,
    address,
    city,
    state,
    zip,
    travelRadius,
    shopId,
    shopName,
    services,
    profileImage,
    bio,
    availability,
    completeOnboarding,
    isLoading
  } = useProviderOnboarding();

  const handleComplete = async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // In a real app, you would show an error message to the user
    }
  };

  const formatWorkSituation = (situation: string | null): string => {
    if (!situation) return '';
    
    switch (situation) {
      case 'own_shop': return 'I have my own shop/studio';
      case 'work_at_shop': return 'I work at a shop';
      case 'mobile': return 'I am mobile/I travel to clients';
      case 'home_studio': return 'I work from a home studio';
      default: return situation;
    }
  };

  const formatAddress = (): string => {
    if (workSituation === 'work_at_shop' && shopName) {
      return shopName;
    } else if (workSituation === 'mobile') {
      return `Travel radius: ${travelRadius} miles`;
    } else if (address) {
      return `${address}, ${city}, ${state} ${zip}`;
    }
    return '';
  };

  const formatTimeSlot = (slot: TimeSlot): string => {
    const formatTime = (time: string) => {
      const [hour] = time.split(':');
      const hourNum = parseInt(hour);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      return `${hour12}${period}`;
    };
    
    return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
  };

  const getDaysWithAvailability = () => {
    return Object.entries(availability)
      .filter(([_, slots]) => slots.length > 0)
      .map(([day, slots]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        slots
      }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>GET STARTED</Text>
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>Review your profile</Text>
          <Text style={styles.description}>
            Please review your information before completing your profile setup.
          </Text>

          <View style={styles.summaryContainer}>
            {/* Profile Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <User size={20} color="#D4AF37" />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              <View style={styles.profileSection}>
                {profileImage && profileImage.trim() !== '' ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImagePlaceholderText}>
                      {firstName.charAt(0)}{lastName.charAt(0)}
                    </Text>
                  </View>
                )}
                
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{firstName} {lastName}</Text>
                  <Text style={styles.profileType}>{providerType}</Text>
                  {bio ? (
                    <Text style={styles.profileBio} numberOfLines={2}>
                      {bio}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Work Situation Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Briefcase size={20} color="#D4AF37" />
                <Text style={styles.sectionTitle}>Work Information</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Work Situation:</Text>
                <Text style={styles.infoValue}>{formatWorkSituation(workSituation)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>{formatAddress()}</Text>
              </View>
            </View>

            {/* Services Section */}
            {services.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <DollarSign size={20} color="#D4AF37" />
                  <Text style={styles.sectionTitle}>Services</Text>
                </View>
                
                {services.map((service: ProviderService) => (
                  <View key={service.id} style={styles.serviceItem}>
                    <View style={styles.serviceNamePrice}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Availability Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={20} color="#D4AF37" />
                <Text style={styles.sectionTitle}>Availability</Text>
              </View>
              
              {getDaysWithAvailability().length > 0 ? (
                getDaysWithAvailability().map(({ day, slots }) => (
                  <View key={day} style={styles.availabilityItem}>
                    <Text style={styles.availabilityDay}>{day}</Text>
                    <View style={styles.availabilitySlots}>
                      {slots.map((slot: TimeSlot, index: number) => (
                        <Text key={index} style={styles.availabilitySlot}>
                          {formatTimeSlot(slot)}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noAvailability}>No availability set</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="COMPLETE PROFILE"
            onPress={handleComplete}
            loading={isLoading}
            testID="complete-profile-button"
          />
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.back()}
            testID="go-back-button"
          >
            <Text style={styles.editButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 30,
  },
  summaryContainer: {
    marginBottom: 30,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#D4AF37',
    marginLeft: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileImagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#D4AF37',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 120,
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#CCCCCC',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  serviceItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  serviceNamePrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#D4AF37',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  availabilityItem: {
    marginBottom: 12,
  },
  availabilityDay: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  availabilitySlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  availabilitySlot: {
    fontSize: 14,
    color: '#CCCCCC',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  noAvailability: {
    fontSize: 14,
    color: '#CCCCCC',
    fontStyle: 'italic' as const,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  editButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  editButtonText: {
    fontSize: 16,
    color: '#CCCCCC',
    textDecorationLine: 'underline' as const,
  },
});