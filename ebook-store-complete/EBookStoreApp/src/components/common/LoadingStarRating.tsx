import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES } from '../../constants';

const LoadingStarRating: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    );

    // Shimmer animation
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true
      })
    );

    pulse.start();
    shimmer.start();

    return () => {
      pulse.stop();
      shimmer.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.loadingStar,
              {
                opacity: pulseAnim,
                transform: [
                  {
                    scale: shimmerAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.1, 1]
                    })
                  }
                ]
              }
            ]}
          />
        ))}
      </View>
      <Animated.Text
        style={[
          styles.loadingText,
          {
            opacity: pulseAnim
          }
        ]}
      >
        Đang tải đánh giá...
      </Animated.Text>
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
    gap: 8,
  },
  loadingStar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  loadingText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default LoadingStarRating;
