import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, MapPin, Star, Filter, Heart, Clock, Award, TrendingUp, History, Map } from "lucide-react-native";
import { router } from "expo-router";
import { mockProviders, mockCategories } from "@/mocks/providers";
import FilterModal, { FilterState } from "@/components/FilterModal";
import { useSavedProviders } from "@/providers/SavedProvidersProvider";
import { useOnboarding } from "@/providers/OnboardingProvider";
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { serviceCategory, userStylePreferences, requestLocationPermission, locationPermissionGranted } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(serviceCategory || "All");
  const [location, setLocation] = useState("New York, NY");
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showMapView, setShowMapView] = useState<boolean>(false);
  const [recentSearches] = useState<string[]>(["Hair Stylists near me", "Nail art", "Massage therapy"]);
  const [trendingProviders] = useState<string[]>(["1", "3", "5"]); // Provider IDs
  const [recentlyViewed] = useState<string[]>(["2", "4"]); // Provider IDs
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 1000 },
    distance: 50,
    availability: "All Times",
    sortBy: "Distance",
    minRating: 0,
  });
  
  const { toggleSavedProvider, isProviderSaved } = useSavedProviders();

  // Request location permission when component mounts
  useEffect(() => {
    const checkLocationPermission = async () => {
      if (!locationPermissionGranted && !isRequestingLocation) {
        setIsRequestingLocation(true);
        try {
          // This will trigger the native permission dialog
          await requestLocationPermission();
          
          // If permission granted, try to get current location
          if (locationPermissionGranted) {
            try {
              const { status } = await Location.getForegroundPermissionsAsync();
              if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                // In a real app, you would use reverse geocoding to get the address
                // For now, we'll just show the coordinates
                setLocation(`${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)}`);
              }
            } catch (error) {
              console.error('Error getting location:', error);
            }
          }
        } catch (error) {
          console.error('Error requesting location permission:', error);
        } finally {
          setIsRequestingLocation(false);
        }
      }
    };
    
    checkLocationPermission();
  }, [locationPermissionGranted, requestLocationPermission]);

  // Generate search suggestions based on query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const suggestions = mockProviders
        .filter(provider => 
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.specialties?.some(specialty => 
            specialty.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
        .slice(0, 5)
        .map(provider => provider.name);
      
      const serviceSuggestions = mockProviders
        .flatMap(provider => provider.specialties || [])
        .filter(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3);
      
      setSearchSuggestions([...suggestions, ...serviceSuggestions]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const filteredProviders = useMemo(() => {
    let filtered = mockProviders.filter(provider => {
      const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           provider.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           provider.specialties?.some(specialty => 
                             specialty.toLowerCase().includes(searchQuery.toLowerCase())
                           );
      const matchesCategory = selectedCategory === "All" || provider.category === selectedCategory;
      const matchesPrice = provider.startingPrice >= filters.priceRange.min && 
                          provider.startingPrice <= filters.priceRange.max;
      const matchesDistance = provider.distance <= filters.distance;
      const matchesRating = provider.rating >= filters.minRating;
      const matchesAvailability = filters.availability === "All Times" || 
                                 (filters.availability === "Available Today" && provider.availableToday);
      
      // Match user style preferences from onboarding if any are selected
      const matchesStylePreferences = userStylePreferences.length === 0 || 
                                     provider.specialties?.some(specialty => 
                                       userStylePreferences.includes(specialty.toLowerCase())
                                     );
      
      return matchesSearch && matchesCategory && matchesPrice && 
             matchesDistance && matchesRating && matchesAvailability && matchesStylePreferences;
    });

    // Sort providers
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "Rating":
          return b.rating - a.rating;
        case "Price: Low to High":
          return a.startingPrice - b.startingPrice;
        case "Price: High to Low":
          return b.startingPrice - a.startingPrice;
        case "Most Popular":
          return b.reviewCount - a.reviewCount;
        case "Distance":
        default:
          return a.distance - b.distance;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, filters, userStylePreferences]);

  const handleProviderPress = (providerId: string) => {
    router.push(`/provider/${providerId}`);
  };

  const handleSaveProvider = (providerId: string) => {
    const scaleAnim = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    toggleSavedProvider(providerId);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSearchSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const getTrendingProviders = () => {
    return mockProviders.filter(provider => trendingProviders.includes(provider.id));
  };

  const getRecentlyViewedProviders = () => {
    return mockProviders.filter(provider => recentlyViewed.includes(provider.id));
  };

  const renderProviderCard = (item: any, isHorizontal = false) => {
    const isSaved = isProviderSaved(item.id);
    const cardStyle = isHorizontal ? styles.horizontalCard : styles.providerCard;
    const imageStyle = isHorizontal ? styles.horizontalImage : styles.profileImage;
    
    return (
      <View style={cardStyle}>
        <TouchableOpacity 
          style={isHorizontal ? styles.horizontalCardContent : styles.cardContent}
          onPress={() => handleProviderPress(item.id)}
        >
          {isHorizontal ? (
            <>
              <Image source={{ uri: item.profileImage }} style={imageStyle} />
              <View style={styles.horizontalDetails}>
                <Text style={styles.horizontalName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.horizontalShop} numberOfLines={1}>{item.shopName}</Text>
                <View style={styles.horizontalRating}>
                  <Star color="#D4AF37" size={12} fill="#D4AF37" />
                  <Text style={styles.horizontalRatingText}>{item.rating}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.horizontalSaveButton}
                onPress={() => handleSaveProvider(item.id)}
              >
                <Heart 
                  color={isSaved ? "#D4AF37" : "#666"} 
                  size={16} 
                  fill={isSaved ? "#D4AF37" : "transparent"}
                />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.cardHeader}>
                <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
                <View style={styles.providerDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.providerName}>{item.name}</Text>
                    {item.isPopular && (
                      <View style={styles.popularBadge}>
                        <Award color="#D4AF37" size={12} />
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.shopName}>{item.shopName}</Text>
                  <View style={styles.ratingRow}>
                    <Star color="#D4AF37" size={14} fill="#D4AF37" />
                    <Text style={styles.rating}>{item.rating}</Text>
                    <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
                    <Text style={styles.distance}>• {item.distanceText}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => handleSaveProvider(item.id)}
                >
                  <Heart 
                    color={isSaved ? "#D4AF37" : "#666"} 
                    size={20} 
                    fill={isSaved ? "#D4AF37" : "transparent"}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.specialtiesContainer}>
                {item.specialties?.slice(0, 3).map((specialty: string) => (
                  <View key={specialty} style={styles.specialtyChip}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.cardFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Starting from</Text>
                  <Text style={styles.price}>${item.startingPrice}</Text>
                </View>
                <View style={styles.availabilityContainer}>
                  <Clock color={item.availableToday ? "#10B981" : "#666"} size={14} />
                  <Text style={[styles.availabilityText, { color: item.availableToday ? "#10B981" : "#666" }]}>
                    {item.availableToday ? "Available today" : "Book ahead"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.locationContainer}>
          <MapPin color="#D4AF37" size={20} />
          <Text style={styles.locationText}>{location}</Text>
          <TouchableOpacity>
            <Text style={styles.changeLocation}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#999" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search providers or services..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter color="#D4AF37" size={20} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => setShowMapView(!showMapView)}
          >
            <Map color={showMapView ? "#D4AF37" : "#999"} size={20} />
          </TouchableOpacity>
        </View>

        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`suggestion-${index}`}
                style={styles.suggestionItem}
                onPress={() => handleSearchSuggestion(suggestion)}
              >
                <Search color="#666" size={16} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {mockCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {searchQuery === "" && (
        <ScrollView 
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <History color="#D4AF37" size={20} />
                <Text style={styles.sectionTitle}>Recent Searches</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={`recent-${index}`}
                    style={styles.recentSearchChip}
                    onPress={() => setSearchQuery(search)}
                  >
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Trending Providers */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <TrendingUp color="#D4AF37" size={20} />
              <Text style={styles.sectionTitle}>Trending in Your Area</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {getTrendingProviders().map((provider) => (
                <View key={provider.id} style={styles.horizontalCardWrapper}>
                  {renderProviderCard(provider, true)}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Clock color="#D4AF37" size={20} />
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {getRecentlyViewedProviders().map((provider) => (
                  <View key={provider.id} style={styles.horizontalCardWrapper}>
                    {renderProviderCard(provider, true)}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* All Providers */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Discover Providers</Text>
            {filteredProviders.slice(0, 5).map((provider) => (
              <View key={provider.id}>
                {renderProviderCard(provider, false)}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {searchQuery !== "" && (
        <FlatList
          data={filteredProviders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => renderProviderCard(item, false)}
        />
      )}
      
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  changeLocation: {
    color: "#D4AF37",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#fff",
  },
  filterButton: {
    padding: 4,
    marginRight: 8,
  },
  mapButton: {
    padding: 4,
  },
  suggestionsContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#333",
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  suggestionText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 12,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  selectedCategoryChip: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  categoryText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: "#000",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  recentSearchChip: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  recentSearchText: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "500",
  },
  horizontalCardWrapper: {
    marginRight: 16,
    width: width * 0.7,
  },
  horizontalCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  horizontalCardContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  horizontalImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  horizontalDetails: {
    flex: 1,
  },
  horizontalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  horizontalShop: {
    fontSize: 12,
    color: "#D4AF37",
    marginBottom: 4,
  },
  horizontalRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  horizontalRatingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  horizontalSaveButton: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  providerCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 8,
  },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
  },
  shopName: {
    fontSize: 14,
    color: "#D4AF37",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  reviewCount: {
    color: "#999",
    fontSize: 12,
    marginLeft: 4,
  },
  distance: {
    color: "#999",
    fontSize: 12,
    marginLeft: 4,
  },
  saveButton: {
    padding: 8,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 6,
  },
  specialtyChip: {
    backgroundColor: "#333",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceLabel: {
    color: "#999",
    fontSize: 12,
    marginRight: 4,
  },
  price: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "bold",
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
});