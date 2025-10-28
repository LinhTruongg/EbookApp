import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BookReaderScreen from '../../src/screens/book/BookReader/BookReaderScreen';

export default function BookReader() {
  const { id } = useLocalSearchParams();

  return (
    <BookReaderScreen />
  );
}