import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Star, MapPin, Clock, Calendar, Heart, UserPlus, MessageCircle, Share2, Grid3X3 } from "lucide-react-native";
import { mockProviders } from "@/mocks/providers";
import type { ProviderPost } from "@/models/database";

type TabType = 'services' | 'portfolio' | 'posts';

export default function ProviderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Find provider from mock data
  const mockProvider = mockProviders.find(p => p.id === id);
  
  if (!mockProvider) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Provider not found</Text>
        </View>
      </View>
    );
  }

  // Enhanced provider data with social features
  const provider = {
    ...mockProvider,
    followerCount: 1247,
    followingCount: 89,
    postsCount: 156,
    isVerified: true,
    posts: [
      {
        id: '1',
        providerId: id as string,
        imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400',
        caption: 'Fresh fade for the weekend! ✂️ #barbershop #fade #freshcut',
        tags: ['barbershop', 'fade', 'freshcut'],
        likes: 89,
        comments: [],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        providerId: id as string,
        imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
        caption: 'Precision beard work 🔥 Book your appointment today!',
        tags: ['beard', 'precision', 'grooming'],
        likes: 124,
        comments: [],
        createdAt: '2024-01-14T15:45:00Z',
        updatedAt: '2024-01-14T15:45:00Z'
      },
      {
        id: '3',
        providerId: id as string,
        imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
        caption: 'Before and after transformation! Amazing results 💯',
        tags: ['transformation', 'beforeafter', 'haircut'],
        likes: 203,
        comments: [],
        createdAt: '2024-01-13T09:20:00Z',
        updatedAt: '2024-01-13T09:20:00Z'
      },
      {
        id: '4',
        providerId: id as string,
        imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
        caption: 'Custom design work - bringing creativity to life! 🎨',
        tags: ['design', 'creative', 'art'],
        likes: 156,
        comments: [],
        createdAt: '2024-01-12T14:10:00Z',
        updatedAt: '2024-01-12T14:10:00Z'
      },
      {
        id: '5',
        providerId: id as string,
        imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
        caption: 'Classic cut never goes out of style ✨',
        tags: ['classic', 'timeless', 'style'],
        likes: 78,
        comments: [],
        createdAt: '2024-01-11T11:30:00Z',
        updatedAt: '2024-01-11T11:30:00Z'
      },
      {
        id: '6',
        providerId: id as string,
        imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400',
        caption: 'Another satisfied client! Thank you for trusting me 🙏',
        tags: ['satisfied', 'client', 'trust'],
        likes: 92,
        comments: [],
        createdAt: '2024-01-10T16:45:00Z',
        updatedAt: '2024-01-10T16:45:00Z'
      }
    ] as ProviderPost[]
  };

  const handleBookAppointment = () => {
    router.push(`/(app)/(client)/booking/select-service?providerId=${id}`);
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleServicePress = (serviceId: string) => {
    router.push(`/(app)/(client)/booking/select-service?providerId=${id}&serviceId=${serviceId}`);
  };

  const renderServicesTab = () => (
    <View style={styles.tabContent}>
      {provider.services?.map((service) => (
        <TouchableOpacity 
          key={service.id} 
          style={styles.serviceItem}
          onPress={() => handleServicePress(service.id)}
        >
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <View style={styles.serviceDetails}>
              <Clock size={14} color="#666" />
              <Text style={styles.serviceDetailText}>{service.duration}</Text>
            </View>
          </View>
          <Text style={styles.servicePrice}>${service.price}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPortfolioTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={provider.portfolio || []}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.portfolioItem, { width: (width - 60) / 2 }]}>
            <Image source={{ uri: item.image }} style={styles.portfolioImage} />
            <View style={styles.portfolioOverlay}>
              <Text style={styles.portfolioTitle}>{item.title}</Text>
              <Text style={styles.portfolioDescription}>{item.description}</Text>
            </View>
          </View>
        )}
        columnWrapperStyle={styles.portfolioRow}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderPostsTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={provider.posts}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.postItem, { width: (width - 60) / 3 }]}>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            <View style={styles.postOverlay}>
              <Heart size={12} color="#fff" />
              <Text style={styles.postLikes}>{item.likes}</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return renderServicesTab();
      case 'portfolio':
        return renderPortfolioTab();
      case 'posts':
        return renderPostsTab();
      default:
        return renderServicesTab();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: provider.profileImage || provider.image }} 
              style={styles.profileImage} 
            />
            {provider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Star size={12} color="#fff" fill="#fff" />
              </View>
            )}
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollowToggle}
            >
              <UserPlus size={16} color={isFollowing ? "#666" : "#fff"} />
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={16} color="#333" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.infoSection}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerCategory}>{provider.category}</Text>
          <Text style={styles.shopName}>{provider.shopName}</Text>
          
          {provider.about && (
            <Text style={styles.bioText}>{provider.about}</Text>
          )}
          
          <View style={styles.locationRow}>
            <MapPin size={14} color="#666" />
            <Text style={styles.locationText}>{provider.address}</Text>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{provider.followerCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{provider.postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text style={styles.statNumber}>{provider.rating}</Text>
            </View>
            <Text style={styles.statLabel}>({provider.reviewCount} reviews)</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'services' && styles.activeTabButton]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'services' && styles.activeTabButtonText]}>
              Services
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'portfolio' && styles.activeTabButton]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'portfolio' && styles.activeTabButtonText]}>
              Portfolio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'posts' && styles.activeTabButton]}
            onPress={() => setActiveTab('posts')}
          >
            <Grid3X3 size={16} color={activeTab === 'posts' ? "#007AFF" : "#666"} />
            <Text style={[styles.tabButtonText, activeTab === 'posts' && styles.activeTabButtonText]}>
              Posts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Fixed Book Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <Calendar size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#666',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  providerCategory: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  shopName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#007AFF',
  },
  tabContent: {
    backgroundColor: '#fff',
    minHeight: 400,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDetailText: {
    fontSize: 12,
    color: '#666',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  portfolioRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  portfolioItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  portfolioImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  portfolioTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  portfolioDescription: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
  },
  postItem: {
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  postOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  postLikes: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  bookButtonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});