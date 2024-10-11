import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Shared/Colors';

export default function SharedHeader({ title }) {
  const navigation = useNavigation();

  return (
    <View style={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor:Colors.ligh_gray }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <AntDesign name="back" size={37} color="black" />
      </TouchableOpacity>
      <Text style={{ fontSize: 25, fontFamily: 'Inter-Black-Semi' }}>{title}</Text>
    </View>
  );
}