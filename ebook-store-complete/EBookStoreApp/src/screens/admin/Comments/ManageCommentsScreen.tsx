import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ManageCommentsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý bình luận</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
});

export default ManageCommentsScreen;


