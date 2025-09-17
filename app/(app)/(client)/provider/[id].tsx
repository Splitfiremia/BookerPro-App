import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";
import { Star, MapPin, Clock, DollarSign, Calendar, Heart } from "lucide-react-native";

export default function ProviderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Mock provider data - in real app, fetch based on ID
  const provider = {
    id,
    name: "John Smith",
    title: "Senior Barber",
    avatar: "https://i.pravatar.cc/300?img=5",
    rating: 4.9,
    reviews: 234,
    location: "123 Main St, New York, NY",
    distance: "0.8 miles",
    about: "Professional barber with 10+ years of experience. Specializing in modern cuts, fades, and beard grooming. Committed to providing exceptional service and ensuring every client leaves looking and feeling their best.",
    services: [
      { id: '1', name: 'Haircut', price: '$35', duration: '30 min' },
      { id: '2', name: 'Beard Trim', price: '$25', duration: '20 min' },
      { id: '3', name: 'Hair & Beard', price: '$55', duration: '45 min' },
      { id: '4', name: 'Hot Towel Shave', price: '$40', duration: '30 min' },
    ],
    availability: "Mon-Sat: 9:00 AM - 7:00 PM",
    images: [
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400",
    ],
  };

  const handleBookAppointment = () => {
    router.push(`/(app)/(client)/booking/select-service?providerId=${id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: provider.avatar }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <TouchableOpacity style={styles.favoriteButton}>
              <Heart size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.infoSection}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerTitle}>{provider.title}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Star size={16} color="#FFB800" />
              <Text style={styles.statText}>{provider.rating}</Text>
              <Text style={styles.statLabel}>({provider.reviews} reviews)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MapPin size={16} color="#666" />
              <Text style={styles.statText}>{provider.distance}</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{provider.about}</Text>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {provider.services.map((service) => (
            <View key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.serviceDetails}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.serviceDetailText}>{service.duration}</Text>
                </View>
              </View>
              <Text style={styles.servicePrice}>{service.price}</Text>
            </View>
          ))}
        </View>

        {/* Gallery Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.galleryContainer}>
              {provider.images.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.galleryImage} />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <MapPin size={20} color="#007AFF" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>{provider.location}</Text>
              <Text style={styles.locationDistance}>{provider.distance} away</Text>
            </View>
          </View>
        </View>

        {/* Availability Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityCard}>
            <Calendar size={20} color="#4CAF50" />
            <Text style={styles.availabilityText}>{provider.availability}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  providerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  providerTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  galleryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  locationDistance: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: '#333',
  },
  bookButtonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});