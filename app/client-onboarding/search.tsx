import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, MapPin, Filter, Star, ChevronLeft } from 'lucide-react-native';

interface Shop {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
}

interface Provider {
  id: string;
  name: string;
  image: string;
  rating: number;
  distance: string;
}

// Mock shops for testing
const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Legacy',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
    description: 'Uptown Barbershop',
    type: 'Barber Shop'
  },
  {
    id: '2',
    name: 'LATHER & FADE',
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400',
    description: 'Lather and Fade Barbershop',
    type: 'Barber Shop'
  },
  {
    id: '3',
    name: 'Elite Cuts',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    description: 'Modern Barbershop & Salon',
    type: 'Barber Shop'
  },
  {
    id: '4',
    name: 'The Gentleman\'s Den',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
    description: 'Traditional Barbershop',
    type: 'Barber Shop'
  },
  {
    id: '5',
    name: 'Fresh Cuts Studio',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
    description: 'Contemporary Hair Studio',
    type: 'Hair Salon'
  }
];

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Papi Kutz',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 5.0,
    distance: '0.6 Miles'
  }
];

const filterOptions = ['Nearby', 'Price', 'Available', 'Top Rated'];

export default function SearchScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const [searchText, setSearchText] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('Nearby');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  
  const isShopSearch = type === 'shop';
  
  const filteredShops = mockShops.filter(shop => 
    shop.name.toLowerCase().includes(searchText.toLowerCase()) ||
    shop.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleNext = () => {
    if (isShopSearch && selectedShop) {
      console.log('Selected shop:', selectedShop.name);
    }
    router.push('/client-onboarding/payment' as any);
  };
  
  const handleShopSelect = (shop: Shop) => {
    if (!shop?.id?.trim()) return;
    if (!shop?.name?.trim()) return;
    if (shop.name.length > 100) return;
    const sanitizedShop = {
      ...shop,
      name: shop.name.trim(),
      description: shop.description.trim()
    };
    setSelectedShop(sanitizedShop);
  };
  
  if (isShopSearch) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="search-back-button"
        >
          <ChevronLeft size={20} color="#CCCCCC" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        {/* Progress Header */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>GET STARTED</Text>
          <View style={styles.progressDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
        
        {/* Content */}
        <View style={styles.shopSearchContent}>
          <Text style={styles.shopSearchTitle}>Search for your shop</Text>
          <Text style={styles.shopSearchSubtitle}>
            Find the Shop where you work to connect with them.
          </Text>
          
          {/* Search Input */}
          <View style={styles.shopSearchContainer}>
            <Search size={20} color="#666666" />
            <TextInput
              style={styles.shopSearchInput}
              placeholder="Enter shop name or address"
              placeholderTextColor="#666666"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          
          {/* Shop Results */}
          {searchText.length > 0 && (
            <ScrollView style={styles.shopResults} showsVerticalScrollIndicator={false}>
              {filteredShops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={[
                    styles.shopResultItem,
                    selectedShop?.id === shop.id && styles.shopResultItemSelected
                  ]}
                  onPress={() => {
                    if (!shop?.id?.trim()) return;
                    if (!shop?.name?.trim()) return;
                    if (shop.name.length > 100) return;
                    const sanitizedShop = {
                      ...shop,
                      name: shop.name.trim(),
                      description: shop.description.trim()
                    };
                    handleShopSelect(sanitizedShop);
                  }}
                >
                  <Image source={{ uri: shop.image }} style={styles.shopResultImage} />
                  <View style={styles.shopResultInfo}>
                    <Text style={styles.shopResultName}>{shop.name}</Text>
                    <Text style={styles.shopResultDescription}>{shop.description}</Text>
                    <Text style={styles.shopResultType}>{shop.type}</Text>
                  </View>
                  {selectedShop?.id === shop.id && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        
        {/* Continue Button */}
        <View style={styles.shopSearchBottom}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              (!selectedShop || searchText.length === 0) && styles.continueButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!selectedShop || searchText.length === 0}
          >
            <Text style={[
              styles.continueButtonText,
              (!selectedShop || searchText.length === 0) && styles.continueButtonTextDisabled
            ]}>
              CONTINUE
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#666666"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <TouchableOpacity style={styles.locationContainer}>
          <MapPin size={16} color="#666666" />
          <Text style={styles.locationText}>Houston, TX</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
          <Filter size={16} color="#000000" />
        </TouchableOpacity>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => {
              if (!filter?.trim()) return;
              if (filter.length > 100) return;
              const sanitizedFilter = filter.trim();
              setSelectedFilter(sanitizedFilter);
            }}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shops Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SHOPS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockShops.map((shop) => (
              <View key={shop.id} style={styles.shopCard}>
                <Image source={{ uri: shop.image }} style={styles.shopImage} />
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  <Text style={styles.shopDescription}>{shop.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Providers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROVIDERS</Text>
          {mockProviders.map((provider) => (
            <View key={provider.id} style={styles.providerCard}>
              <View style={styles.providerHeader}>
                <Image source={{ uri: provider.image }} style={styles.providerAvatar} />
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerService}>Papi Kutz</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.rating}>{provider.rating} (5)</Text>
                    <Text style={styles.distance}>{provider.distance}</Text>
                  </View>
                </View>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioContainer}>
                {[1, 2, 3, 4].map((item) => (
                  <Image 
                    key={item}
                    source={{ uri: `https://images.unsplash.com/photo-150795191487${item}?w=200&q=80` }}
                    style={styles.portfolioImage} 
                  />
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.bottomTitle}>SEARCH</Text>
        <Text style={styles.bottomDescription}>
          Quickly find top providers in your area with just a few taps.
        </Text>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  filtersContainer: {
    paddingBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 24,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 24,
    marginBottom: 16,
    letterSpacing: 1,
  },
  shopCard: {
    width: 160,
    marginLeft: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  shopImage: {
    width: '100%',
    height: 100,
  },
  shopInfo: {
    padding: 12,
  },
  shopName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shopDescription: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  providerCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  providerService: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
    marginRight: 16,
  },
  distance: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  portfolioContainer: {
    marginBottom: 16,
  },
  portfolioImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  bottomSection: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 10,
  },
  backText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  progressText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  activeDot: {
    backgroundColor: '#FFD700',
  },
  shopSearchContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  shopSearchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 36,
  },
  shopSearchSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 32,
    lineHeight: 24,
  },
  shopSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  shopSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  shopResults: {
    flex: 1,
  },
  shopResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shopResultItemSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#2A2A1A',
  },
  shopResultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  shopResultInfo: {
    flex: 1,
  },
  shopResultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  shopResultDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  shopResultType: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    marginLeft: 12,
  },
  shopSearchBottom: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  continueButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#333333',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
  continueButtonTextDisabled: {
    color: '#666666',
  },
  bottomTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  bottomDescription: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
});