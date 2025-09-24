import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Star, MapPin, Clock, Calendar, Heart, UserPlus, MessageCircle, Share2, Grid3X3, Award, Scissors, Palette, Camera, Play, Eye } from "lucide-react-native";
import { mockProviders } from "@/mocks/providers";
import { useSocial } from "@/providers/SocialProvider";

type TabType = 'services' | 'portfolio' | 'posts';

export default function ProviderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const { isFollowing, followProvider, unfollowProvider, getProviderPosts } = useSocial();

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
  } as const;

  const handleBookAppointment = () => {
    router.push(`/(app)/(client)/booking/select-service?providerId=${id}`);
  };

  const handleFollowToggle = async () => {
    if (!id) return;
    
    try {
      if (isFollowing(id)) {
        await unfollowProvider(id);
      } else {
        await followProvider(id);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
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

  const renderPortfolioTab = () => {
    const portfolioData = provider.portfolio || [];
    const featuredWork = portfolioData.slice(0, 2);
    const recentWork = portfolioData.slice(2);
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Provider Stats */}
        <View style={styles.portfolioStats}>
          <View style={styles.statItemMain}>
            <Award size={20} color="#FFB800" />
            <Text style={styles.statValue}>5+</Text>
            <Text style={styles.statLabel}>Years Experience</Text>
          </View>
          <View style={styles.statItemMain}>
            <Scissors size={20} color="#007AFF" />
            <Text style={styles.statValue}>500+</Text>
            <Text style={styles.statLabel}>Happy Clients</Text>
          </View>
          <View style={styles.statItemMain}>
            <Palette size={20} color="#FF3B30" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Specialties</Text>
          </View>
        </View>
        
        {/* Specialties */}
        <View style={styles.specialtiesSection}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.specialtiesContainer}>
            {(provider.specialties || ['Haircuts', 'Color', 'Styling', 'Treatments']).map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Featured Work */}
        {featuredWork.length > 0 && (
          <View style={styles.portfolioSection}>
            <Text style={styles.sectionTitle}>Featured Work</Text>
            <View style={styles.featuredGrid}>
              {featuredWork.map((item) => (
                <TouchableOpacity key={item.id} style={styles.featuredItem}>
                  {item.image && item.image.trim() !== '' ? (
                    <Image source={{ uri: item.image }} style={styles.featuredImage} />
                  ) : (
                    <View style={[styles.featuredImage, styles.placeholderImage]}>
                      <Camera size={32} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.featuredOverlay}>
                    <View style={styles.featuredHeader}>
                      <Text style={styles.featuredTitle}>{item.title}</Text>
                      <View style={styles.viewsContainer}>
                        <Eye size={12} color="#fff" />
                        <Text style={styles.viewsText}>1.2k</Text>
                      </View>
                    </View>
                    <Text style={styles.featuredDescription}>{item.description}</Text>
                    <View style={styles.featuredTags}>
                      <View style={styles.featuredTag}>
                        <Text style={styles.featuredTagText}>Before & After</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Recent Work Grid */}
        {recentWork.length > 0 && (
          <View style={styles.portfolioSection}>
            <Text style={styles.sectionTitle}>Recent Work</Text>
            <View style={styles.portfolioGrid}>
              {recentWork.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.portfolioItem, { width: (width - 60) / 2 }]}>
                  {item.image && item.image.trim() !== '' ? (
                    <Image source={{ uri: item.image }} style={styles.portfolioImage} />
                  ) : (
                    <View style={[styles.portfolioImage, styles.placeholderImage]}>
                      <Grid3X3 size={32} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.portfolioOverlay}>
                    <Text style={styles.portfolioTitle}>{item.title}</Text>
                    <Text style={styles.portfolioDescription}>{item.description}</Text>
                  </View>
                  <View style={styles.portfolioActions}>
                    <View style={styles.portfolioLikes}>
                      <Heart size={12} color="#fff" />
                      <Text style={styles.portfolioLikesText}>24</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Video Portfolio */}
        <View style={styles.portfolioSection}>
          <Text style={styles.sectionTitle}>Video Portfolio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map((index) => (
              <TouchableOpacity key={index} style={styles.videoItem}>
                <View style={styles.videoThumbnail}>
                  <View style={styles.videoPlaceholder}>
                    <Camera size={24} color="#ccc" />
                  </View>
                  <View style={styles.playButton}>
                    <Play size={16} color="#fff" fill="#fff" />
                  </View>
                </View>
                <Text style={styles.videoTitle}>Hair Transformation #{index}</Text>
                <Text style={styles.videoDuration}>2:30</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  const renderPostsTab = () => {
    const posts = getProviderPosts((id as string) || '');
    return (
      <View style={styles.tabContent}>
        <FlatList
          data={posts.map(p => ({ id: p.id, imageUrl: p.imageUri, likes: p.likes }))}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.postItem, { width: (width - 60) / 3 }]}>
              {item.imageUrl && item.imageUrl.trim() !== '' ? (
                <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
              ) : (
                <View style={[styles.postImage, styles.placeholderImage]}>
                  <Grid3X3 size={24} color="#ccc" />
                </View>
              )}
              <View style={styles.postOverlay}>
                <Heart size={12} color="#fff" />
                <Text style={styles.postLikes}>{item.likes}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={(
            <View style={styles.emptyPostsContainer}>
              <Text style={styles.emptyPostsText}>No posts yet</Text>
            </View>
          )}
        />
      </View>
    );
  };

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
            {(provider.profileImage && provider.profileImage.trim() !== '') || (provider.image && provider.image.trim() !== '') ? (
              <Image 
                source={{ uri: provider.profileImage || provider.image }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderAvatar]}>
                <UserPlus size={32} color="#ccc" />
              </View>
            )}
            {provider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Star size={12} color="#fff" fill="#fff" />
              </View>
            )}
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.followButton, isFollowing(id || '') && styles.followingButton]}
              onPress={handleFollowToggle}
            >
              <UserPlus size={16} color={isFollowing(id || '') ? "#666" : "#fff"} />
              <Text style={[styles.followButtonText, isFollowing(id || '') && styles.followingButtonText]}>
                {isFollowing(id || '') ? 'Following' : 'Follow'}
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
          <View style={styles.statItemMain}>
            <Text style={styles.statNumber}>{provider.followerCount.toLocaleString()}</Text>
            <Text style={styles.statLabelMain}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItemMain}>
            <Text style={styles.statNumber}>{provider.postsCount}</Text>
            <Text style={styles.statLabelMain}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItemMain}>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text style={styles.statNumber}>{provider.rating}</Text>
            </View>
            <Text style={styles.statLabelMain}>({provider.reviewCount} reviews)</Text>
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
  statItemMain: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabelMain: {
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
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  specialtiesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  portfolioSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featuredGrid: {
    gap: 12,
  },
  featuredItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  featuredDescription: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 8,
  },
  featuredTags: {
    flexDirection: 'row',
    gap: 6,
  },
  featuredTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  portfolioActions: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  portfolioLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  portfolioLikesText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  videoItem: {
    width: 140,
    marginRight: 12,
  },
  videoThumbnail: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  videoPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  videoDuration: {
    fontSize: 10,
    color: '#666',
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
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPostsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyPostsText: {
    color: '#666',
  },
});