import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Star, Heart, Clock, Award, Grid, List } from "lucide-react-native";
import { router } from "expo-router";
import { mockProviders, mockCategories } from "@/mocks/providers";
import { useSavedProviders } from "@/providers/SavedProvidersProvider";

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { savedProviders, toggleSavedProvider } = useSavedProviders();

  const savedProviderData = useMemo(() => {
    return mockProviders.filter(provider => savedProviders.includes(provider.id));
  }, [savedProviders]);

  const filteredProviders = useMemo(() => {
    if (selectedCategory === "All") return savedProviderData;
    return savedProviderData.filter(provider => provider.category === selectedCategory);
  }, [savedProviderData, selectedCategory]);

  const handleProviderPress = (providerId: string) => {
    router.push(`/provider/${providerId}`);
  };

  const renderProviderCard = (item: any) => {
    if (viewMode === "grid") {
      return (
        <TouchableOpacity 
          style={styles.gridCard}
          onPress={() => handleProviderPress(item.id)}
        >
          <Image source={{ uri: item.profileImage }} style={styles.gridImage} />
          <TouchableOpacity 
            style={styles.gridHeartButton}
            onPress={() => toggleSavedProvider(item.id)}
          >
            <Heart color="#D4AF37" size={16} fill="#D4AF37" />
          </TouchableOpacity>
          <View style={styles.gridCardContent}>
            <Text style={styles.gridProviderName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.gridShopName} numberOfLines={1}>{item.shopName}</Text>
            <View style={styles.gridRating}>
              <Star color="#D4AF37" size={12} fill="#D4AF37" />
              <Text style={styles.gridRatingText}>{item.rating}</Text>
            </View>
            <Text style={styles.gridPrice}>From ${item.startingPrice}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.providerCard}>
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={() => handleProviderPress(item.id)}
        >
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
              onPress={() => toggleSavedProvider(item.id)}
            >
              <Heart color="#D4AF37" size={20} fill="#D4AF37" />
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
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Heart color="#333" size={64} />
      <Text style={styles.emptyTitle}>No Saved Providers</Text>
      <Text style={styles.emptyDescription}>
        Start exploring and save your favorite providers to see them here
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => router.push("/(tabs)/explore")}
      >
        <Text style={styles.exploreButtonText}>Explore Providers</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Saved Providers</Text>
          <Text style={styles.subtitle}>{savedProviderData.length} saved</Text>
        </View>

        {savedProviderData.length > 0 && (
          <>
            <View style={styles.controls}>
              <View style={styles.viewToggle}>
                <TouchableOpacity
                  style={[styles.viewButton, viewMode === "list" && styles.activeViewButton]}
                  onPress={() => setViewMode("list")}
                >
                  <List color={viewMode === "list" ? "#000" : "#666"} size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.viewButton, viewMode === "grid" && styles.activeViewButton]}
                  onPress={() => setViewMode("grid")}
                >
                  <Grid color={viewMode === "grid" ? "#000" : "#666"} size={20} />
                </TouchableOpacity>
              </View>
            </View>

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
          </>
        )}
      </View>

      {savedProviderData.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredProviders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          renderItem={({ item }) => renderProviderCard(item)}
        />
      )}
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
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 2,
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: "#D4AF37",
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
  gridCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridHeartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16,
    padding: 6,
  },
  gridCardContent: {
    padding: 12,
  },
  gridProviderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  gridShopName: {
    fontSize: 12,
    color: "#D4AF37",
    marginBottom: 6,
  },
  gridRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  gridRatingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  gridPrice: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});