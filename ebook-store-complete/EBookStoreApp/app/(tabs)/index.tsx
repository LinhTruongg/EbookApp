import React from 'react';
import { useRouter } from 'expo-router';
import HomeScreen from '../../src/screens/home/Home/HomeScreen';

export default function Home() {
  const router = useRouter();
  
  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'BookDetail') {
        router.push(`/book-detail/${params.bookId}`);
      } else if (screen === 'CategoryDetail') {
        router.push(`/category-detail/${params.categoryId}`);
      } else if (screen === 'Search') {
        router.push('/search');
      }
    }
  };

  return <HomeScreen navigation={navigation} />;
}