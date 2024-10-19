import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import Colors from '../Shared/Colors';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

export default function SubHeading({ subHeadingTitle, onViewAll }) {
  const [fontsLoaded] = useFonts({
    'SourceSans3-Bold': require('../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Log the onViewAll function to check if it is received appropriately
  console.log('onViewAll function:', onViewAll);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subHeadingTitle}</Text>
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAll}>view all</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'SourceSans3-Bold',
  },
  viewAll: {
    fontFamily: 'Inter-Black',
    color: Colors.PRIMARY,
  },
};