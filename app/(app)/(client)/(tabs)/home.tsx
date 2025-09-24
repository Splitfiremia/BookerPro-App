import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Animated,
  Modal,
} from 'react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { Search, MapPin, Filter, Star, CreditCard, Heart, X, Clock, TrendingUp } from 'lucide-react-native';
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
  { id: 'nearby', label: 'Nearby', icon: MapPin },
  { id: 'price', label: 'Price', icon: null },
  { id: 'available', label: 'Available', icon: Clock },
  { id: 'rating', label: 'Top Rated', icon: Star },
];

const searchSuggestions = [
  'Haircut',
  'Hair Color',
  'Highlights',
  'Balayage',
  'Beard Trim',
  'Manicure',
  'Pedicure',
  'Facial',
  'Massage',
  'Eyebrow Threading',
  'Hair Wash',
  'Blowout',
  'Hair Extensions',
  'Keratin Treatment',
  'Hair Styling',
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
  const searchInputRef = useRef<TextInput>(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const suggestionAnimation = useRef(new Animated.Value(0)).current;

  // Simulate location permission check
  useEffect(() => {
    // In a real app, you would check location permissions here
    // For now, we'll show the location unavailable state
    setLocationEnabled(false);
  }, []);

  // Animate search focus
  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused, searchAnimation]);

  // Animate suggestions
  useEffect(() => {
    Animated.timing(suggestionAnimation, {
      toValue: showSearchSuggestions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSearchSuggestions, suggestionAnimation]);

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
        // Filter for available providers (mock implementation)
        filtered = filtered.filter(provider => provider.rating > 4.0);
        break;
      case 'price':
        // Sort by rating as a proxy for price range
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
    searchInputRef.current?.blur();
  }, []);

  const clearSearch = useCallback(() => {
    setSearchText('');
    searchInputRef.current?.focus();
  }, []);

  const renderShopCard = ({ item }: { item: Shop }) => (
    <TouchableOpacity style={styles.shopCard}>
      <ImageWithFallback
        source={{ uri: item.image }}
        style={styles.shopImage}
        fallbackIcon="image"
      />
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
        <ImageWithFallback
          source={{ uri: item.profileImage }}
          style={styles.providerAvatar}
          fallbackIcon="user"
        />
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
        {item.portfolio?.slice(0, 4).map((portfolioItem) => (
          <ImageWithFallback
            key={portfolioItem.id}
            source={{ uri: portfolioItem.image }}
            style={styles.portfolioImage}
            fallbackIcon="camera"
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
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              borderColor: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['transparent', COLORS.accent],
              }),
              borderWidth: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 2],
              }),
            }
          ]}
        >
          <Search size={20} color={COLORS.lightGray} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search services, providers, shops..."
            placeholderTextColor={COLORS.lightGray}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            returnKeyType="search"
            testID="search-input"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={COLORS.lightGray} />
            </TouchableOpacity>
          )}
        </Animated.View>
        
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
      <Modal
        visible={showSearchSuggestions}
        transparent
        animationType="none"
        onRequestClose={() => setShowSearchSuggestions(false)}
      >
        <TouchableOpacity 
          style={styles.suggestionOverlay}
          activeOpacity={1}
          onPress={() => setShowSearchSuggestions(false)}
        >
          <Animated.View 
            style={[
              styles.suggestionsContainer,
              {
                opacity: suggestionAnimation,
                transform: [{
                  translateY: suggestionAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  })
                }]
              }
            ]}
          >
            {/* Autocomplete suggestions when typing */}
            {searchText.trim() && autocompleteSuggestions.length > 0 && (
              <View style={styles.suggestionSection}>
                <Text style={styles.suggestionSectionTitle}>Suggestions</Text>
                {autocompleteSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={`autocomplete-${index}`}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Search size={16} color={COLORS.accent} />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Recent searches when not typing */}
            {!searchText.trim() && recentSearches.length > 0 && (
              <View style={styles.suggestionSection}>
                <Text style={styles.suggestionSectionTitle}>Recent Searches</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={`recent-${index}`}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(search)}
                  >
                    <Clock size={16} color={COLORS.lightGray} />
                    <Text style={styles.suggestionText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Popular services when not typing */}
            {!searchText.trim() && (
              <View style={styles.suggestionSection}>
                <Text style={styles.suggestionSectionTitle}>Popular Services</Text>
                {searchSuggestions.slice(0, 8).map((suggestion, index) => (
                  <TouchableOpacity
                    key={`suggestion-${index}`}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <TrendingUp size={16} color={COLORS.accent} />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>

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
                <View key={provider.id}>
                  {renderProviderCard({ item: provider })}
                </View>
              ))}
              {filteredProviders.length === 0 && searchText.trim() && (
                <Text style={styles.noResultsText}>No providers found</Text>
              )}
            </View>
          )}
        </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
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
  quickBookContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  quickBookTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  quickBookButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 200,
  },
  quickBookButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: 1,
  },

  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 120,
  },
  suggestionsContainer: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionSection: {
    paddingVertical: SPACING.md,
  },
  suggestionSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  suggestionText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  searchResultsHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
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