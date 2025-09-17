import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding, ShopServiceCategory } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, Check } from 'lucide-react-native';

export default function ShopType() {
  const router = useRouter();
  const { serviceCategories, setServiceCategories, nextStep } = useShopOwnerOnboarding();
  
  const [selectedCategories, setSelectedCategories] = useState<ShopServiceCategory[]>(serviceCategories);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (category: ShopServiceCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
    setError(null);
  };

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one service category');
      return;
    }
    
    setServiceCategories(selectedCategories);
    nextStep();
    router.push('/shop-owner-onboarding/service-list' as any);
  };

  const categories: ShopServiceCategory[] = ['Haircuts', 'Hair Styling', 'Nails', 'Tattoos', 'Other'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>What services are offered at your shop?</Text>
          <Text style={styles.subtitle}>
            Select all that apply. You can add specific services later.
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryCard,
                selectedCategories.includes(category) && styles.selectedCard
              ]}
              onPress={() => toggleCategory(category)}
              activeOpacity={0.8}
              testID={`category-${category.toLowerCase()}`}
            >
              <Text style={[
                styles.categoryText,
                selectedCategories.includes(category) && styles.selectedText
              ]}>
                {category}
              </Text>
              {selectedCategories.includes(category) && (
                <View style={styles.checkIcon}>
                  <Check size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="shop-type-next-button"
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  categoriesContainer: {
    marginBottom: 32,
  },
  categoryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderColor: '#3b5998',
    backgroundColor: '#EBF0F9',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    color: '#3b5998',
    fontWeight: 'bold',
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b5998',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b5998',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
});