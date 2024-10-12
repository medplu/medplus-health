import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import Colors from '../Shared/Colors'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

export default function SubHeading({subHeadingTitle}) {
  const [fontsLoaded] = useFonts({
    'SourceSans3-Bold': require('../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  return (
    <View style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom:10
    }}>
        <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'SourceSans3-Bold',
        }}>{subHeadingTitle}</Text>
        <Text style={{ fontFamily: 'Inter-Black', color: Colors.PRIMARY }}>view all</Text>
    </View>
  )
}