import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, User, Scissors, Store } from 'lucide-react-native';

export default function ProfileTypeScreen() {
  const handleProfileSelection = (type: 'client' | 'provider' | 'owner') => {
    if (type === 'client') {
      router.push('/client-onboarding/welcome' as any);
    } else if (type === 'provider') {
      router.push('/provider-onboarding');
    } else {
      router.push('/shop-owner-onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.logo}>theCut</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>SIGN UP</Text>
        </View>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.tabText}>LOG IN</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>SELECT PROFILE TYPE</Text>
        
        {/* Client Option */}
        <TouchableOpacity 
          style={[styles.profileOption, styles.clientOption]}
          onPress={() => handleProfileSelection('client')}
        >
          <View style={styles.iconContainer}>
            <User size={32} color="#000000" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>CLIENT</Text>
            <Text style={styles.optionDescription}>Search providers and book appointments</Text>
          </View>
        </TouchableOpacity>

        {/* Provider Option */}
        <TouchableOpacity 
          style={[styles.profileOption, styles.providerOption]}
          onPress={() => handleProfileSelection('provider')}
        >
          <View style={styles.iconContainer}>
            <Scissors size={32} color="#FFFFFF" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>PROVIDER</Text>
            <Text style={styles.optionDescription}>Manage your business and clients</Text>
          </View>
        </TouchableOpacity>

        {/* Shop Owner Option */}
        <TouchableOpacity 
          style={[styles.profileOption, styles.ownerOption]}
          onPress={() => handleProfileSelection('owner')}
        >
          <View style={styles.iconContainer}>
            <Store size={32} color="#FFFFFF" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>SHOP OWNER</Text>
            <Text style={styles.optionDescription}>Manage your shops and providers</Text>
          </View>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => handleProfileSelection('client')}
        >
          <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  logo: {
    fontSize: 48,
    fontWeight: '300',
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    marginRight: 48, // Compensate for back button
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 40,
  },
  tab: {
    flex: 1,
    paddingBottom: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  clientOption: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  providerOption: {
    backgroundColor: 'transparent',
    borderColor: '#333333',
  },
  ownerOption: {
    backgroundColor: 'transparent',
    borderColor: '#333333',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
});