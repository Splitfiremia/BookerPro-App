import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Search, Clock, TrendingUp } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

interface SearchSuggestionsProps {
  visible: boolean;
  searchText: string;
  autocompleteSuggestions: string[];
  recentSearches: string[];
  popularServices: string[];
  onSuggestionPress: (suggestion: string) => void;
  onClose: () => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  visible,
  searchText,
  autocompleteSuggestions,
  recentSearches,
  popularServices,
  onSuggestionPress,
  onClose,
}) => {
  const suggestionAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(suggestionAnimation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, suggestionAnimation]);

  const renderSuggestionItem = (suggestion: string, icon: React.ReactNode, key: string) => (
    <TouchableOpacity
      key={key}
      style={styles.suggestionItem}
      onPress={() => onSuggestionPress(suggestion)}
    >
      {icon}
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.suggestionOverlay}
        activeOpacity={1}
        onPress={onClose}
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
              {autocompleteSuggestions.map((suggestion, index) => 
                renderSuggestionItem(
                  suggestion,
                  <Search size={16} color={COLORS.accent} />,
                  `autocomplete-${index}`
                )
              )}
            </View>
          )}
          
          {/* Recent searches when not typing */}
          {!searchText.trim() && recentSearches.length > 0 && (
            <View style={styles.suggestionSection}>
              <Text style={styles.suggestionSectionTitle}>Recent Searches</Text>
              {recentSearches.map((search, index) => 
                renderSuggestionItem(
                  search,
                  <Clock size={16} color={COLORS.lightGray} />,
                  `recent-${index}`
                )
              )}
            </View>
          )}
          
          {/* Popular services when not typing */}
          {!searchText.trim() && (
            <View style={styles.suggestionSection}>
              <Text style={styles.suggestionSectionTitle}>Popular Services</Text>
              {popularServices.slice(0, 8).map((suggestion, index) => 
                renderSuggestionItem(
                  suggestion,
                  <TrendingUp size={16} color={COLORS.accent} />,
                  `suggestion-${index}`
                )
              )}
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  suggestionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 120,
  },
  suggestionsContainer: {
    ...GLASS_STYLES.card,
    marginHorizontal: SPACING.md,
    maxHeight: 400,
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
});