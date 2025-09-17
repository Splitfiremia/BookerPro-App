import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { Search, MapPin, Filter, Star, CreditCard } from 'lucide-react-native';
import { mockProviders } from '@/mocks/providers';
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

export default function HomeScreen() {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('nearby');
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Simulate location permission check
  React.useEffect(() => {
    // In a real app, you would check location permissions here
    // For now, we'll show the location unavailable state
    setLocationEnabled(false);
  }, []);

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
          <Search size={20} color={COLORS.lightGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={COLORS.lightGray}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <TouchableOpacity style={styles.locationContainer}>
          <MapPin size={16} color={COLORS.lightGray} />
          <Text style={styles.locationText}>Current Location</Text>
        </TouchableOpacity>
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
                  size={16} 
                  color={selectedFilter === filter.id ? COLORS.background : COLORS.white} 
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
            <Text style={styles.sectionTitle}>PROVIDERS</Text>
            {mockProviders.slice(0, 3).map((provider) => (
              <View key={provider.id}>
                {renderProviderCard({ item: provider })}
              </View>
            ))}
          </View>
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: SPACING.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.white,
  },
  filterText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  filterTextActive: {
    color: COLORS.background,
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
});