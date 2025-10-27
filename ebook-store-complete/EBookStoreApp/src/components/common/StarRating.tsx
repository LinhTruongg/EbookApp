import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  showText?: boolean;
  maxRating?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onRatingChange,
  size = 'medium',
  interactive = false,
  showText = true,
  maxRating = 5
}) => {
  // Ensure rating is a number
  const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
  const [hoverRating, setHoverRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const getStarSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: 16, marginRight: 2 };
      case 'large':
        return { fontSize: 24, marginRight: 4 };
      default:
        return { fontSize: 20, marginRight: 3 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return SIZES.font.sm;
      case 'large':
        return SIZES.font.lg;
      default:
        return SIZES.font.md;
    }
  };

  const handleStarPress = (starRating: number) => {
    if (interactive && onRatingChange) {
      // Animation feedback
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();

      // Show feedback
      setShowFeedback(true);
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();

      // Hide feedback after 2 seconds
      setTimeout(() => {
        Animated.timing(feedbackAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => setShowFeedback(false));
      }, 2000);

      onRatingChange(starRating);
    }
  };

  const getFeedbackText = (rating: number) => {
    const feedbacks = {
      1: "Cảm ơn bạn đã chia sẻ!",
      2: "Chúng tôi sẽ cải thiện!",
      3: "Cảm ơn phản hồi của bạn!",
      4: "Tuyệt vời!",
      5: "Xuất sắc! Cảm ơn bạn!"
    };
    return feedbacks[rating] || "";
  };

  const renderStars = () => {
    const stars = [];
    const starSize = getStarSize();
    const displayRating = hoverRating || numericRating;

    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= displayRating;
      const isHalfFilled = i === Math.ceil(displayRating) && displayRating % 1 !== 0;
      
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          onPressIn={() => setHoverRating(i)}
          onPressOut={() => setHoverRating(0)}
          disabled={!interactive}
          style={styles.starContainer}
        >
          <Animated.Text
            style={[
              styles.star,
              starSize,
              isFilled && styles.filledStar,
              isHalfFilled && styles.halfFilledStar,
              interactive && styles.interactiveStar,
              {
                transform: [{ scale: hoverRating === i ? 1.2 : 1 }]
              }
            ]}
          >
            {isHalfFilled ? '☆' : isFilled ? '★' : '☆'}
          </Animated.Text>
        </TouchableOpacity>
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.starsContainer, { transform: [{ scale: scaleAnim }] }]}>
        {renderStars()}
      </Animated.View>
      {showText && (
        <Text style={[styles.ratingText, { fontSize: getTextSize() }]}>
          {numericRating.toFixed(1)}/5
        </Text>
      )}
      {showFeedback && (
        <Animated.View style={[styles.feedbackContainer, { opacity: feedbackAnim }]}>
          <Text style={styles.feedbackText}>
            {getFeedbackText(numericRating)}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  star: {
    color: '#E0E0E0',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  filledStar: {
    color: '#FFD700',
    textShadowColor: 'rgba(255,215,0,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  halfFilledStar: {
    color: '#FFD700',
  },
  interactiveStar: {
    opacity: 1,
  },
  ratingText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  feedbackContainer: {
    position: 'absolute',
    top: -40,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  feedbackText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StarRating;
