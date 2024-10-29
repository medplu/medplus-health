import * as React from 'react';
import { Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const router = useRouter();

  const handlePress = () => {
    router.push('/search');
  };

  return (
    <Searchbar
      placeholder="Search"
      onChangeText={setSearchQuery}
      value={searchQuery}
      onFocus={handlePress} // Navigate to full-screen search on focus
    />
  );
};

export default SearchBar;