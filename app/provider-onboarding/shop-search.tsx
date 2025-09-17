import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useProviderOnboarding, ShopInfo } from '@/providers/ProviderOnboardingProvider';
import { Search, Store, Send } from 'lucide-react-native';

export default function ShopSearchScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    searchShops,
    setShopInfo,
    nextStep 
  } = useProviderOnboarding();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ShopInfo[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  // Search for shops when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true);
      setShowNotFound(false);
      
      // Simulate network delay
      const timer = setTimeout(() => {
        const results = searchShops(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowNotFound(results.length === 0);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowNotFound(false);
    }
  }, [searchQuery, searchShops]);

  const handleSelectShop = (shop: ShopInfo) => {
    setSelectedShop(shop);
  };

  const handleContinueWithShop = () => {
    if (selectedShop) {
      setShopInfo(selectedShop.id, selectedShop.name, selectedShop.address);
      nextStep();
      router.replace('/provider-onboarding/services');
    }
  };

  const handleContinueAsIndependent = () => {
    nextStep();
    router.replace('/provider-onboarding/service-address');
  };

  const handleInviteOwner = () => {
    setShowInviteForm(true);
  };

  const handleSendInvite = () => {
    // In a real app, this would send an SMS or email to the shop owner
    console.log('Sending invite to:', ownerName, ownerPhone);
    
    // Continue as independent after sending invite
    handleContinueAsIndependent();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>GET STARTED</Text>
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        </View>

        <View style={styles.content}>
          {!showInviteForm ? (
            <>
              <Text style={styles.question}>Search for your shop</Text>
              <Text style={styles.description}>
                Find the shop where you work to connect with them.
              </Text>

              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Search size={20} color="#CCCCCC" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Enter shop name or address"
                    placeholderTextColor="#666666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    testID="shop-search-input"
                  />
                </View>

                {isSearching && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#D4AF37" />
                    <Text style={styles.loadingText}>Searching...</Text>
                  </View>
                )}

                {searchResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    {searchResults.map(shop => (
                      <TouchableOpacity
                        key={shop.id}
                        style={[
                          styles.shopItem,
                          selectedShop?.id === shop.id && styles.selectedShopItem
                        ]}
                        onPress={() => handleSelectShop(shop)}
                        testID={`shop-item-${shop.id}`}
                      >
                        <View style={styles.shopIconContainer}>
                          <Store size={24} color="#D4AF37" />
                        </View>
                        <View style={styles.shopInfoContainer}>
                          <Text style={styles.shopName}>{shop.name}</Text>
                          <Text style={styles.shopAddress}>{shop.address}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {showNotFound && (
                  <View style={styles.notFoundContainer}>
                    <Text style={styles.notFoundText}>
                      No shops found matching your search.
                    </Text>
                    <View style={styles.notFoundActions}>
                      <TouchableOpacity
                        style={styles.notFoundAction}
                        onPress={handleInviteOwner}
                        testID="invite-owner-button"
                      >
                        <Send size={20} color="#D4AF37" />
                        <Text style={styles.notFoundActionText}>Invite Shop Owner</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.notFoundAction}
                        onPress={handleContinueAsIndependent}
                        testID="continue-independent-button"
                      >
                        <Store size={20} color="#D4AF37" />
                        <Text style={styles.notFoundActionText}>Continue as Independent</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.question}>Invite Shop Owner</Text>
              <Text style={styles.description}>
                Send an invitation to your shop owner to join the platform.
              </Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>OWNER NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter shop owner's name"
                    placeholderTextColor="#666666"
                    value={ownerName}
                    onChangeText={setOwnerName}
                    testID="owner-name-input"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>OWNER PHONE NUMBER</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter shop owner's phone number"
                    placeholderTextColor="#666666"
                    value={ownerPhone}
                    onChangeText={setOwnerPhone}
                    keyboardType="phone-pad"
                    testID="owner-phone-input"
                  />
                </View>

                <View style={styles.messageContainer}>
                  <Text style={styles.messageLabel}>INVITATION MESSAGE</Text>
                  <View style={styles.messagePreview}>
                    <Text style={styles.messageText}>
                      Hi {ownerName || '[Owner Name]'}, I&apos;m setting up on BookerPro. Can you create a shop account so I can join? Here&apos;s the link: [App Store Link]
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {!showInviteForm ? (
            <GradientButton
              title="CONTINUE"
              onPress={handleContinueWithShop}
              disabled={!selectedShop}
              testID="continue-button"
            />
          ) : (
            <View style={styles.inviteButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowInviteForm(false)}
                testID="cancel-invite-button"
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <GradientButton
                title="SEND INVITE"
                onPress={handleSendInvite}
                disabled={!ownerName || !ownerPhone}
                testID="send-invite-button"
                style={styles.sendInviteButton}
              />
            </View>
          )}
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
  searchContainer: {
    marginBottom: 30,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    color: '#CCCCCC',
    marginLeft: 10,
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 10,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedShopItem: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  shopIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shopInfoContainer: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  notFoundContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  notFoundActions: {
    width: '100%',
  },
  notFoundAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  notFoundActionText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginLeft: 10,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  messageContainer: {
    marginTop: 10,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  messagePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  messageText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  inviteButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  sendInviteButton: {
    flex: 2,
  },
});