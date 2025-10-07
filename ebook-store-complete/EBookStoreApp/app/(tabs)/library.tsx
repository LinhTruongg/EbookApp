import React from 'react';
import { useRouter } from 'expo-router';
import LibraryScreen from '../../src/screens/library/Library/LibraryScreen';

export default function Library() {
  const router = useRouter();
  
  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'BookDetail') {
        router.push(`/book-detail/${params.bookId}`);
      } else if (screen === 'BookReader') {
        router.push(`/book-reader/${params.bookId}`);
      }
    }
  };

  return <LibraryScreen navigation={navigation} />;
}