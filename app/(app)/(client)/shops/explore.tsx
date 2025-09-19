import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { Search, MapPin, Star, Users } from 'lucide-react-native';
import { mockShops, getShopRating, getShopProviders, getShopStartingPrice } from '@/mocks/shops';
import { router } from 'expo-router';

const filterOptions = [
  { id: 'all', label: 'All Shops' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'available', label: 'Available Now' },
];

interface LocationCoordinates {
  lat: number;
  lng: number;
}

export default function ShopsExploreScreen() {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [nearbyShops, setNearbyShops] = useState<typeof mockShops>([]);
  const [isLoadingShops, setIsLoadingShops] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const fetchShopsNearby = useCallback(async (location: LocationCoordinates) => {
    console.log('Fetching shops near:', location);
    setIsLoadingShops(true);
    
    try {
      // Simulate API call to backend
      // In a real app, this would be:
      // const response = await fetch(`/api/shops/nearby?lat=${location.lat}&lng=${location.lng}`);
      // const shops = await response.json();
      
      // For now, simulate with mock data and add distance
      const simulatedShops = mockShops.map(shop => ({
        ...shop,
        distance: Math.random() * 10 + 0.5,
        distanceText: `${(Math.random() * 10 + 0.5).toFixed(1)} mi`
      })).sort((a, b) => a.distance - b.distance);
      
      setNearbyShops(simulatedShops);
      console.log(`Found ${simulatedShops.length} shops nearby`);
    } catch (error) {
      console.error('Error fetching nearby shops:', error);
      Alert.alert('Error', 'Failed to fetch nearby shops. Please try again.');
    } finally {
      setIsLoadingShops(false);
    }
  }, []);

  const handlePlaceSelect = useCallback((data: any, details: any) => {
    console.log('Place selected:', data.description);
    console.log('Place details:', details);
    
    if (details?.geometry?.location) {
      const location: LocationCoordinates = {
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng
      };
      
      setSearchText(data.description);
      fetchShopsNearby(location);
    } else {
      console.warn('No location details available for selected place');
      Alert.alert('Location Error', 'Unable to get location details for this place.');
    }
  }, [fetchShopsNearby]);

  const shopsToDisplay = nearbyShops.length > 0 ? nearbyShops : mockShops;
  const filteredShops = shopsToDisplay.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         shop.description?.toLowerCase().includes(searchText.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'rating':
        return getShopRating(shop.id).rating >= 4.5;
      case 'available':
        // Mock availability check - in real app would check actual availability
        return Math.random() > 0.5;
      default:
        return true;
    }
  });

  const renderShopCard = ({ item }: { item: typeof mockShops[0] }) => {
    const shopRating = getShopRating(item.id);
    const providers = getShopProviders(item.id);
    const startingPrice = getShopStartingPrice(item.id);

    return (
      <TouchableOpacity 
        style={styles.shopCard}
        onPress={() => router.push(`/shops/${item.id}` as any)}
        testID={`shop-card-${item.id}`}
      >
        <Image source={{ uri: item.image }} style={styles.shopImage} />
        
        <View style={styles.shopContent}>
          <View style={styles.shopHeader}>
            <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={12} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.rating}>
                {shopRating.rating > 0 ? shopRating.rating.toFixed(1) : 'New'}
              </Text>
              {shopRating.reviewCount > 0 && (
                <Text style={styles.reviewCount}>({shopRating.reviewCount})</Text>
              )}
            </View>
          </View>

          <View style={styles.shopLocation}>
            <MapPin size={12} color={COLORS.lightGray} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.address}, {item.city}
            </Text>
          </View>

          <Text style={styles.shopDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.shopFooter}>
            <View style={styles.providersInfo}>
              <Users size={14} color={COLORS.lightGray} />
              <Text style={styles.providersText}>
                {providers.length} provider{providers.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            {startingPrice > 0 && (
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>From </Text>
                <Text style={styles.priceValue}>${startingPrice}</Text>
              </View>
            )}
          </View>

          {/* Provider Preview */}
          {providers.length > 0 && (
            <View style={styles.providerPreview}>
              <View style={styles.providerPreviewContainer}>
                {providers.slice(0, 3).map((provider) => (
                  <View key={provider.id} style={styles.providerPreviewItem}>
                    <Image 
                      source={{ uri: provider.profileImage }} 
                      style={styles.providerPreviewAvatar} 
                    />
                    <Text style={styles.providerPreviewName} numberOfLines={1}>
                      {provider.name.split(' ')[0]}
                    </Text>
                  </View>
                ))}
                {providers.length > 3 && (
                  <View style={[styles.providerPreviewItem, { alignItems: 'center' }]}>
                    <View style={styles.moreProvidersIndicator}>
                      <Text style={styles.moreProvidersText}>+{providers.length - 3}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.headerTitle}>Explore Shops</Text>
        
        <View style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            placeholder="Search for locations or shops..."
            onPress={handlePlaceSelect}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
              language: 'en',
              types: 'establishment',
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            styles={{
              container: {
                flex: 1,
              },
              textInputContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'transparent',
                borderTopWidth: 0,
                borderBottomWidth: 0,
                paddingHorizontal: 0,
              },
              textInput: {
                backgroundColor: 'transparent',
                color: COLORS.white,
                fontSize: FONT_SIZES.md,
                fontFamily: FONTS.regular,
                paddingLeft: 40,
                paddingRight: SPACING.md,
                height: 48,
                borderRadius: 0,
                margin: 0,
              },
              listView: {
                backgroundColor: COLORS.card,
                borderRadius: BORDER_RADIUS.md,
                marginTop: SPACING.xs,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              },
              row: {
                backgroundColor: 'transparent',
                padding: SPACING.md,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.gray,
              },
              description: {
                color: COLORS.white,
                fontSize: FONT_SIZES.sm,
                fontFamily: FONTS.regular,
              },
              predefinedPlacesDescription: {
                color: COLORS.lightGray,
              },
            }}
            renderLeftButton={() => (
              <Search size={20} color={COLORS.lightGray} style={styles.searchIcon} />
            )}
            textInputProps={{
              placeholderTextColor: COLORS.lightGray,
              returnKeyType: 'search',
              onChangeText: (text: string) => setSearchText(text),
              value: searchText,
            }}
            debounce={300}
            minLength={2}
            onFail={(error) => {
              console.error('Google Places API Error:', error);
              Alert.alert('Search Error', 'Unable to search locations. Please check your internet connection.');
            }}
            onNotFound={() => {
              console.log('No results found');
            }}
            onTimeout={() => {
              console.log('Request timeout');
              Alert.alert('Timeout', 'Search request timed out. Please try again.');
            }}
          />
        </View>
      </View>

      {/* Filter Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter.id)}
            testID={`filter-${filter.id}`}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {nearbyShops.length > 0 ? 'Nearby: ' : ''}{filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Loading State */}
      {isLoadingShops ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding shops near you...</Text>
        </View>
      ) : (
        /* Shops List */
        <FlatList
          data={filteredShops}
          renderItem={renderShopCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.shopsList}
          testID="shops-list"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  filtersContainer: {
    paddingBottom: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  filterTextActive: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  resultsHeader: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  resultsCount: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  shopsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  shopCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  shopImage: {
    width: '100%',
    height: 160,
  },
  shopContent: {
    padding: SPACING.md,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  shopName: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginRight: SPACING.md,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 80,
  },
  rating: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  shopLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  shopDescription: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  shopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  providersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providersText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  priceValue: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
  },
  providerPreview: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    paddingTop: SPACING.sm,
  },
  providerPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  providerPreviewItem: {
    alignItems: 'center',
    marginRight: SPACING.sm,
    width: 44,
  },
  providerPreviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 4,
  },
  providerPreviewName: {
    color: COLORS.lightGray,
    fontSize: 10,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 12,
  },
  moreProvidersIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: SPACING.sm,
  },
  moreProvidersText: {
    color: COLORS.lightGray,
    fontSize: 9,
    fontFamily: FONTS.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});