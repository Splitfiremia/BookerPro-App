import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';
import { MapPin, Heart } from 'lucide-react-native';
import { mockProviders } from '@/mocks/providers';
import { useSocial } from '@/providers/SocialProvider';
import { router } from 'expo-router';
import { FeatureErrorBoundary } from '@/components/SpecializedErrorBoundaries';

// Import the smaller components
import { SearchBar } from '@/components/home/SearchBar';
import { FilterBar } from '@/components/home/FilterBar';
import { SearchSuggestions } from '@/components/home/SearchSuggestions';
import { ProviderCard } from '@/components/home/ProviderCard';
import { ShopCard } from '@/components/home/ShopCard';

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

const searchSuggestions = [
  'Haircut', 'Hair Color', 'Highlights', 'Balayage', 'Beard Trim',
  'Manicure', 'Pedicure', 'Facial', 'Massage', 'Eyebrow Threading',
  'Hair Wash', 'Blowout', 'Hair Extensions', 'Keratin Treatment', 'Hair Styling',
];

const recentSearches = [
  'Barber near me',
  'Hair salon Manhattan',
  'Nail salon',
];

export default function HomeScreen() {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('nearby');
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const { getFollowedCount } = useSocial();

  // Simulate location permission check
  useEffect(() => {
    setLocationEnabled(false);
  }, []);

  // Enhanced autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchText.trim()) return [];
    
    const query = searchText.toLowerCase();
    const suggestions = [];
    
    // Add matching services
    const matchingServices = searchSuggestions.filter(service => 
      service.toLowerCase().includes(query)
    );
    suggestions.push(...matchingServices.slice(0, 3));
    
    // Add matching provider names
    const matchingProviders = mockProviders
      .filter(provider => provider.name.toLowerCase().includes(query))
      .map(provider => provider.name)
      .slice(0, 2);
    suggestions.push(...matchingProviders);
    
    // Add matching shop names
    const matchingShops = mockShops
      .filter(shop => shop.name.toLowerCase().includes(query))
      .map(shop => shop.name)
      .slice(0, 2);
    suggestions.push(...matchingShops);
    
    return [...new Set(suggestions)].slice(0, 6);
  }, [searchText]);

  // Filter data based on search and filters
  const filteredProviders = useMemo(() => {
    let filtered = [...mockProviders];
    
    // Apply search filter
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(query) ||
        provider.services?.some(service => 
          service.name.toLowerCase().includes(query)
        ) ||
        provider.specialties?.some(specialty => 
          specialty.toLowerCase().includes(query)
        ) ||
        provider.shopName?.toLowerCase().includes(query)
      );
    }
    
    // Apply additional filters
    switch (selectedFilter) {
      case 'rating':
        filtered = filtered.filter(provider => provider.rating >= 4.5);
        break;
      case 'available':
        filtered = filtered.filter(provider => provider.rating > 4.0);
        break;
      case 'price':
        filtered = filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    return filtered;
  }, [searchText, selectedFilter]);

  const filteredShops = useMemo(() => {
    if (!searchText.trim()) return mockShops;
    
    const query = searchText.toLowerCase();
    return mockShops.filter(shop => 
      shop.name.toLowerCase().includes(query) ||
      shop.type.toLowerCase().includes(query) ||
      shop.description.toLowerCase().includes(query)
    );
  }, [searchText]);

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    setShowSearchSuggestions(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
    setTimeout(() => setShowSearchSuggestions(false), 200);
  }, []);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setSearchText(suggestion);
    setShowSearchSuggestions(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  const renderShopCard = ({ item }: { item: Shop }) => (
    <ShopCard shop={item} />
  );

  return (
    <FeatureErrorBoundary featureName="HomeScreen">
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <SearchBar
            searchText={searchText}
            onSearchTextChange={setSearchText}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            isSearchFocused={isSearchFocused}
            onClear={clearSearch}
          />
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.locationContainer}>
              <MapPin size={16} color={COLORS.lightGray} />
              <Text style={styles.locationText}>Current Location</Text>
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
        <FilterBar
          selectedFilter={selectedFilter}
          onFilterSelect={setSelectedFilter}
        />

        {/* Quick Book Section */}
        <View style={styles.quickBookContainer}>
          <Text style={styles.quickBookTitle}>Book Your Next Cut</Text>
          <TouchableOpacity 
            style={styles.quickBookButton}
            onPress={() => router.push('/(app)/(client)/booking/select-service')}
            testID="quick-book-button"
          >
            <Text style={styles.quickBookButtonText}>BOOK NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Search Suggestions Modal */}
        <SearchSuggestions
          visible={showSearchSuggestions}
          searchText={searchText}
          autocompleteSuggestions={autocompleteSuggestions}
          recentSearches={recentSearches}
          popularServices={searchSuggestions}
          onSuggestionPress={handleSuggestionPress}
          onClose={() => setShowSearchSuggestions(false)}
        />

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
            {/* Search Results */}
            {searchText.trim() && (
              <View style={styles.searchResultsHeader}>
                <Text style={styles.searchResultsText}>
                  {filteredProviders.length + filteredShops.length} results for &quot;{searchText}&quot;
                </Text>
              </View>
            )}
            
            {/* Shops Section */}
            {(!searchText.trim() || filteredShops.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SHOPS</Text>
                <FlatList
                  data={filteredShops}
                  renderItem={renderShopCard}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shopsContainer}
                  ListEmptyComponent={
                    searchText.trim() ? (
                      <Text style={styles.noResultsText}>No shops found</Text>
                    ) : null
                  }
                />
              </View>
            )}

            {/* Providers Section */}
            {(!searchText.trim() || filteredProviders.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  PROVIDERS {searchText.trim() && `(${filteredProviders.length})`}
                </Text>
                {filteredProviders.slice(0, searchText.trim() ? filteredProviders.length : 3).map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
                {filteredProviders.length === 0 && searchText.trim() && (
                  <Text style={styles.noResultsText}>No providers found</Text>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </FeatureErrorBoundary>
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
    ...GLASS_STYLES.card,
    borderRadius: 20,
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
  quickBookContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    ...GLASS_STYLES.card,
    marginHorizontal: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  quickBookTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  quickBookButton: {
    ...GLASS_STYLES.button.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    minWidth: 200,
  },
  quickBookButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: 1,
  },
  searchResultsHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...GLASS_STYLES.card,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchResultsText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.lightGray,
  },
  noResultsText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.lightGray,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
});