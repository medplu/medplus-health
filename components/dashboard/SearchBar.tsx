import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const SearchBar: React.FC = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push('/search');
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Ionicons name="search" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default SearchBar;