import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface RatingDistributionChartProps {
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  totalRatings: number;
}

const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({
  ratingDistribution,
  totalRatings
}) => {
  const animatedValues = useRef(
    ratingDistribution.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animate bars on mount
    const animations = ratingDistribution.map((_, index) =>
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 800,
        delay: index * 100,
        useNativeDriver: false
      })
    );

    Animated.parallel(animations).start();
  }, [ratingDistribution]);

  const getBarColor = (rating: number) => {
    const colors = {
      5: '#4CAF50', // Green
      4: '#8BC34A', // Light Green
      3: '#FFC107', // Amber
      2: '#FF9800', // Orange
      1: '#F44336'  // Red
    };
    return colors[rating as keyof typeof colors] || '#E0E0E0';
  };

  const getPercentage = (count: number) => {
    return totalRatings > 0 ? (count / totalRatings) * 100 : 0;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phân bố đánh giá</Text>
      
      <View style={styles.chartContainer}>
        {ratingDistribution.map((item, index) => {
          const percentage = getPercentage(item.count);
          
          return (
            <View key={item.rating} style={styles.ratingRow}>
              <View style={styles.ratingLabel}>
                <Text style={styles.starText}>{item.rating}★</Text>
              </View>
              
              <View style={styles.barContainer}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: getBarColor(item.rating),
                      width: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${percentage}%`]
                      })
                    }
                  ]}
                />
              </View>
              
              <View style={styles.countContainer}>
                <Text style={styles.countText}>{item.count}</Text>
                <Text style={styles.percentageText}>
                  ({percentage.toFixed(0)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      
      {totalRatings === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingLabel: {
    width: 30,
    alignItems: 'center',
  },
  starText: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
    minWidth: 2,
  },
  countContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  countText: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  percentageText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default RatingDistributionChart;
