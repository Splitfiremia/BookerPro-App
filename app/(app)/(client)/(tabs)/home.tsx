import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { MapPin, Filter, Star, CreditCard, Heart } from 'lucide-react-native';
import { mockProviders } from '@/mocks/providers';
import { useSocial } from '@/providers/SocialProvider';
import { router } from 'expo-router';

interface Shop {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
}

const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Uptown And Fresh 183rd Street',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
    description: 'Ronaldinho barbershop With The Best.',
    type: 'Barber Shop'
  },
  {
    id: '2',
    name: 'Aura Barber & Beauty Studio',
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400',
    description: 'Premium cuts and styling services.',
    type: 'Barber & Beauty Studio'
  },
  {
    id: '3',
    name: 'Elite Cuts Barbershop',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    description: 'Traditional and modern barbering.',
    type: 'Barbershop'
  }
];

const filterOptions = [
  { id: 'filter', label: 'Filter', icon: Filter },
  { id: 'nearby', label: 'Nearby', icon: null },
  { id: 'price', label: 'Price', icon: null },
  { id: 'available', label: 'Available', icon: null },
  { id: 'accepts', label: 'Accepts', icon: null },
];

interface LocationCoordinates {
  lat: number;
  lng: number;
}

function HomeScreenContent() {
  const [selectedFilter, setSelectedFilter] = useState<string>('nearby');
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const [nearbyProviders, setNearbyProviders] = useState<typeof mockProviders>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const insets = useSafeAreaInsets();
  const { getFollowedCount } = useSocial();

  // Simulate location permission check
  useEffect(() => {
    // In a real app, you would check location permissions here
    // For now, we'll show the location unavailable state
    setLocationEnabled(false);
  }, []);

  const fetchProvidersNearby = useCallback(async (location: LocationCoordinates, placeName?: string) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.error('Invalid location coordinates provided');
      return;
    }
    
    const sanitizedPlaceName = placeName?.trim().slice(0, 200) || '';
    console.log('Fetching providers near:', location, 'Place:', sanitizedPlaceName);
    setIsLoadingProviders(true);
    
    try {
      // TODO: Replace with real backend API call when ready
      // const response = await fetch(`/api/providers/nearby?lat=${location.lat}&lng=${location.lng}`);
      // const providers = await response.json();
      
      // For now, simulate with mock data and add distance
      const simulatedProviders = mockProviders.map(provider => ({
        ...provider,
        distanceText: `${(Math.random() * 5 + 0.5).toFixed(1)} mi`,
        distance: Math.random() * 5 + 0.5
      })).sort((a, b) => a.distance - b.distance);
      
      setNearbyProviders(simulatedProviders);
      setLocationEnabled(true);
      if (sanitizedPlaceName) {
        setSelectedLocation(sanitizedPlaceName);
      }
      
      console.log(`Found ${simulatedProviders.length} providers near ${sanitizedPlaceName || 'selected location'}`);
    } catch (error) {
      console.error('Error fetching nearby providers:', error);
    } finally {
      setIsLoadingProviders(false);
    }
  }, []);

  const handlePlaceSelect = useCallback((data: any, details: any) => {
    if (!data?.description) {
      console.warn('Invalid place data received');
      return;
    }
    
    console.log('Place selected:', data.description);
    console.log('Place details:', details);
    
    if (details?.geometry?.location?.lat && details?.geometry?.location?.lng) {
      const location: LocationCoordinates = {
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng
      };
      fetchProvidersNearby(location, data.description);
    } else {
      console.warn('No location details available for selected place');
    }
  }, [fetchProvidersNearby]);



  const renderShopCard = ({ item }: { item: Shop }) => (
    <TouchableOpacity style={styles.shopCard}>
      <Image source={{ uri: item.image }} style={styles.shopImage} />
      <View style={styles.shopInfo}>
        <Text style={styles.shopName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.shopDescription} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.shopType}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProviderCard = ({ item }: { item: typeof mockProviders[0] }) => (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={() => router.push(`/(app)/(client)/provider/${item.id}`)}
    >
      <View style={styles.providerHeader}>
        <Image source={{ uri: item.profileImage }} style={styles.providerAvatar} />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.name}</Text>
          <Text style={styles.providerService}>Free Advice</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={COLORS.accent} fill={COLORS.accent} />
            <Text style={styles.rating}>{item.rating} ({item.reviewCount})</Text>
            <Text style={styles.distance}>{item.distanceText}</Text>
          </View>
          <Text style={styles.location}>New York, NY • $</Text>
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioContainer}>
        {item.portfolio?.slice(0, 4).map((portfolioItem, index) => (
          <Image 
            key={portfolioItem.id} 
            source={{ uri: portfolioItem.image }} 
            style={styles.portfolioImage} 
          />
        ))}
      </ScrollView>
      
      <View style={styles.providerFooter}>
        <View style={styles.acceptsCards}>
          <CreditCard size={16} color={COLORS.white} />
          <Text style={styles.acceptsText}>Accepts cards</Text>
        </View>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>BOOK APPOINTMENT</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            placeholder="Search for locations, stylists, or services"
            onPress={handlePlaceSelect}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
              language: 'en',
              types: 'establishment',
              components: 'country:us',
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            requestUrl={{
              url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
              useOnPlatform: 'web',
            }}
            styles={{
              container: {
                flex: 1,
              },
              textInputContainer: {
                backgroundColor: 'transparent',
                borderTopWidth: 0,
                borderBottomWidth: 0,
                paddingHorizontal: 0,
                marginHorizontal: 0,
              },
              textInput: {
                backgroundColor: 'transparent',
                color: COLORS.white,
                fontSize: FONT_SIZES.md,
                fontFamily: FONTS.regular,
                paddingLeft: 0,
                paddingRight: 0,
                marginLeft: 0,
                marginRight: 0,
                height: 48,
                borderWidth: 0,
              },
              listView: {
                backgroundColor: COLORS.card,
                borderRadius: BORDER_RADIUS.md,
                marginTop: 4,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              },
              row: {
                backgroundColor: COLORS.card,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
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
            textInputProps={{
              placeholderTextColor: COLORS.lightGray,
              returnKeyType: 'search',
            }}
            debounce={300}
            minLength={2}
            onFail={(error) => {
              console.error('Google Places API Error:', error);
              console.error('API Key:', process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ? 'Present' : 'Missing');
            }}
            onNotFound={() => {
              console.log('No results found');
            }}
            nearbyPlacesAPI="GooglePlacesSearch"
            GooglePlacesSearchQuery={{
              rankby: 'distance',
            }}
            timeout={20000}
            keepResultsAfterBlur={true}
          />

        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.locationContainer}>
            <MapPin size={16} color={COLORS.lightGray} />
            <Text style={styles.locationText}>
              {selectedLocation || 'Current Location'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.followingButton}
            onPress={() => router.push('/(app)/(client)/following')}
          >
            <Heart size={16} color={COLORS.accent} />
            {getFollowedCount() > 0 && (
              <View style={styles.followingBadge}>
                <Text style={styles.followingBadgeText}>{getFollowedCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map((filter) => {
          const IconComponent = filter.icon;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              {IconComponent && (
                <IconComponent 
                  size={14} 
                  color="#333333" 
                />
              )}
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Actions */}
      <View style={styles.mainActionsContainer}>
        <TouchableOpacity 
          style={styles.mainActionButton}
          onPress={() => router.push('/(app)/(client)/shops/explore')}
          testID="find-shop-button"
        >
          <Text style={styles.mainActionTitle}>Find a Shop</Text>
          <Text style={styles.mainActionSubtitle}>Browse local shops and their teams</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.mainActionButton}
          onPress={() => {/* Navigate to provider browse */}}
          testID="find-provider-button"
        >
          <Text style={styles.mainActionTitle}>Find a Provider</Text>
          <Text style={styles.mainActionSubtitle}>Browse individual providers</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {!locationEnabled ? (
        // Location Unavailable State
        <View style={styles.locationUnavailableContainer}>
          <View style={styles.locationUnavailableContent}>
            <Text style={styles.locationUnavailableTitle}>LOCATION UNAVAILABLE</Text>
            <Text style={styles.locationUnavailableText}>
              Please allow theCut access to your location (when in use) in your device settings, or type in a location to search.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Shops Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SHOPS</Text>
            <FlatList
              data={mockShops}
              renderItem={renderShopCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shopsContainer}
            />
          </View>

          {/* Providers Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {nearbyProviders.length > 0 ? 'NEARBY PROVIDERS' : 'PROVIDERS'}
            </Text>
            {isLoadingProviders ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Finding providers near you...</Text>
              </View>
            ) : (
              (nearbyProviders.length > 0 ? nearbyProviders : mockProviders).slice(0, 3).map((provider) => (
                <View key={provider.id}>
                  {renderProviderCard({ item: provider })}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default function HomeScreen() {
  return <HomeScreenContent />;
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 48,
    position: 'relative',
    zIndex: 1,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  followingButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  followingBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  followingBadgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  locationText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
    maxWidth: 200,
  },
  filtersContainer: {
    paddingBottom: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    whiteSpace: 'nowrap' as any,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d1d1',
    backgroundColor: '#ffffff',
  },
  filterButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d1d1',
  },
  filterText: {
    color: '#333333',
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },
  filterTextActive: {
    color: '#333333',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  shopsContainer: {
    paddingHorizontal: SPACING.md,
  },
  shopCard: {
    width: 200,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  shopImage: {
    width: '100%',
    height: 120,
  },
  shopInfo: {
    padding: SPACING.md,
  },
  shopName: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  shopDescription: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  shopType: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  providerCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  providerService: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  rating: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
    marginRight: SPACING.md,
  },
  distance: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  location: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  portfolioContainer: {
    marginBottom: SPACING.md,
  },
  portfolioImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acceptsCards: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptsText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  bookButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  bookButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  locationUnavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  locationUnavailableContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  locationUnavailableTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 1,
  },
  locationUnavailableText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
  mainActionsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  mainActionButton: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  mainActionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  mainActionSubtitle: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  loadingContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});