import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../../constants';

export default function CategoryBooksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Category Books Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: SIZES.font.lg,
    color: COLORS.text,
  },
});
