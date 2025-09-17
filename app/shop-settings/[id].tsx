import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Switch,
  Alert,
  Platform,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  X,
  Save,
  Camera,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Settings,
  Trash2,
  Plus,
  Edit3,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useShopManagement, ShopSettings, ShopHours } from "@/providers/ShopManagementProvider";

export default function ShopSettingsScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const { shops, addShop, updateShop, deleteShop, isLoading } = useShopManagement();
  
  const isNewShop = id === "new";
  const existingShop = isNewShop ? null : shops.find(shop => shop.id === id);
  
  const [formData, setFormData] = useState<Partial<ShopSettings>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    image: "",
    hours: [
      { day: "Monday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
      { day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "19:00" },
      { day: "Wednesday", isOpen: true, openTime: "09:00", closeTime: "19:00" },
      { day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
      { day: "Friday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
      { day: "Saturday", isOpen: true, openTime: "08:00", closeTime: "18:00" },
      { day: "Sunday", isOpen: true, openTime: "10:00", closeTime: "17:00" },
    ],
    services: [],
    photos: [],
    holidaySchedule: [],
    preferences: {
      bookingAdvanceTime: 24,
      cancellationPolicy: "24 hours notice required",
      depositRequired: false,
      depositAmount: 0,
      autoConfirmBookings: false,
      allowOnlineBooking: true,
      requireClientNotes: false,
    },
  });

  useEffect(() => {
    if (existingShop) {
      setFormData(existingShop);
    }
  }, [existingShop]);

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.address || !formData.city || !formData.state) {
        const message = "Please fill in all required fields";
        if (Platform.OS === 'web') {
          console.error("Validation Error:", message);
        } else {
          Alert.alert("Validation Error", message);
        }
        return;
      }

      if (isNewShop) {
        await addShop(formData as Omit<ShopSettings, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>);
        const message = "Shop created successfully!";
        if (Platform.OS === 'web') {
          console.log("Success:", message);
        } else {
          Alert.alert("Success", message);
        }
      } else {
        await updateShop(id as string, formData);
        const message = "Shop updated successfully!";
        if (Platform.OS === 'web') {
          console.log("Success:", message);
        } else {
          Alert.alert("Success", message);
        }
      }
      
      router.back();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save shop";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const handleDelete = async () => {
    if (isNewShop) return;
    
    const confirmDelete = () => {
      deleteShop(id as string)
        .then(() => {
          const message = "Shop deleted successfully";
          if (Platform.OS === 'web') {
            console.log("Success:", message);
          } else {
            Alert.alert("Success", message);
          }
          router.back();
        })
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete shop";
          if (Platform.OS === 'web') {
            console.error("Error:", errorMessage);
          } else {
            Alert.alert("Error", errorMessage);
          }
        });
    };

    if (Platform.OS === 'web') {
      if (confirm("Are you sure you want to delete this shop? This action cannot be undone.")) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Shop",
        "Are you sure you want to delete this shop? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: confirmDelete },
        ]
      );
    }
  };

  const updateFormData = (field: keyof ShopSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateHours = (dayIndex: number, field: keyof ShopHours, value: any) => {
    const newHours = [...(formData.hours || [])];
    newHours[dayIndex] = { ...newHours[dayIndex], [field]: value };
    updateFormData('hours', newHours);
  };

  const updatePreferences = (field: string, value: any) => {
    updateFormData('preferences', {
      ...formData.preferences,
      [field]: value,
    });
  };

  if (user?.role !== "owner") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shop Settings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.noAccessText}>Shop settings are only available for shop owners.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNewShop ? "Add New Shop" : "Shop Settings"}
        </Text>
        <View style={styles.headerActions}>
          {!isNewShop && (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shop Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Photo</Text>
          <TouchableOpacity style={styles.imageUpload}>
            {formData.image ? (
              <Image source={{ uri: formData.image }} style={styles.shopImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={32} color="#6B7280" />
                <Text style={styles.imagePlaceholderText}>Add Shop Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Shop Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter shop name"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Describe your shop"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              placeholder="Street address"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                placeholder="City"
                placeholderTextColor="#6B7280"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.inputLabel}>State *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.state}
                onChangeText={(value) => updateFormData('state', value)}
                placeholder="State"
                placeholderTextColor="#6B7280"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.inputLabel}>ZIP</Text>
              <TextInput
                style={styles.textInput}
                value={formData.zip}
                onChangeText={(value) => updateFormData('zip', value)}
                placeholder="ZIP"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              placeholder="(555) 123-4567"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="shop@example.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.textInput}
              value={formData.website}
              onChangeText={(value) => updateFormData('website', value)}
              placeholder="www.yourshop.com"
              placeholderTextColor="#6B7280"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          
          {formData.hours?.map((hour, index) => (
            <View key={hour.day} style={styles.hourRow}>
              <View style={styles.dayColumn}>
                <Text style={styles.dayText}>{hour.day}</Text>
              </View>
              
              <View style={styles.switchColumn}>
                <Switch
                  value={hour.isOpen}
                  onValueChange={(value) => updateHours(index, 'isOpen', value)}
                  trackColor={{ false: "#374151", true: "#3B82F6" }}
                  thumbColor={hour.isOpen ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>
              
              {hour.isOpen && (
                <View style={styles.timeColumn}>
                  <TextInput
                    style={styles.timeInput}
                    value={hour.openTime}
                    onChangeText={(value) => updateHours(index, 'openTime', value)}
                    placeholder="09:00"
                    placeholderTextColor="#6B7280"
                  />
                  <Text style={styles.timeText}>to</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={hour.closeTime}
                    onChangeText={(value) => updateHours(index, 'closeTime', value)}
                    placeholder="18:00"
                    placeholderTextColor="#6B7280"
                  />
                </View>
              )}
              
              {!hour.isOpen && (
                <View style={styles.closedColumn}>
                  <Text style={styles.closedText}>Closed</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Booking Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Preferences</Text>
          
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Allow Online Booking</Text>
              <Text style={styles.preferenceDescription}>
                Let clients book appointments online
              </Text>
            </View>
            <Switch
              value={formData.preferences?.allowOnlineBooking}
              onValueChange={(value) => updatePreferences('allowOnlineBooking', value)}
              trackColor={{ false: "#374151", true: "#3B82F6" }}
              thumbColor={formData.preferences?.allowOnlineBooking ? "#FFFFFF" : "#9CA3AF"}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Auto-Confirm Bookings</Text>
              <Text style={styles.preferenceDescription}>
                Automatically confirm new appointments
              </Text>
            </View>
            <Switch
              value={formData.preferences?.autoConfirmBookings}
              onValueChange={(value) => updatePreferences('autoConfirmBookings', value)}
              trackColor={{ false: "#374151", true: "#3B82F6" }}
              thumbColor={formData.preferences?.autoConfirmBookings ? "#FFFFFF" : "#9CA3AF"}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Require Deposit</Text>
              <Text style={styles.preferenceDescription}>
                Require deposit for bookings
              </Text>
            </View>
            <Switch
              value={formData.preferences?.depositRequired}
              onValueChange={(value) => updatePreferences('depositRequired', value)}
              trackColor={{ false: "#374151", true: "#3B82F6" }}
              thumbColor={formData.preferences?.depositRequired ? "#FFFFFF" : "#9CA3AF"}
            />
          </View>

          {formData.preferences?.depositRequired && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Deposit Amount ($)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.preferences?.depositAmount?.toString() || ""}
                onChangeText={(value) => updatePreferences('depositAmount', parseFloat(value) || 0)}
                placeholder="25"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Booking Advance Time (hours)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.preferences?.bookingAdvanceTime?.toString() || ""}
              onChangeText={(value) => updatePreferences('bookingAdvanceTime', parseInt(value) || 24)}
              placeholder="24"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cancellation Policy</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.preferences?.cancellationPolicy}
              onChangeText={(value) => updatePreferences('cancellationPolicy', value)}
              placeholder="24 hours notice required"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noAccessText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  imageUpload: {
    borderRadius: 12,
    overflow: "hidden",
  },
  shopImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#374151",
    borderStyle: "dashed",
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#374151",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  hourRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  dayColumn: {
    width: 80,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  switchColumn: {
    width: 60,
    alignItems: "center",
  },
  timeColumn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeInput: {
    backgroundColor: "#1F2937",
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#374151",
    width: 60,
    textAlign: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  closedColumn: {
    flex: 1,
    alignItems: "center",
  },
  closedText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  bottomPadding: {
    height: 40,
  },
});