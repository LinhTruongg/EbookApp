import React from 'react';
import { useRouter } from 'expo-router';
import SearchScreen from '../src/screens/home/Search/SearchScreen';

export default function Search() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'BookDetail') {
        router.push(`/book-detail/${params.book.id}`);
      } else if (screen === 'CategoryDetail') {
        router.push(`/category-detail/${params.category.id}`);
      }
    },
    goBack: () => {
      router.back();
    }
  };

  return (
    <SearchScreen
      navigation={navigation}
    />
  );
}