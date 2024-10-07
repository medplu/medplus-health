import { View, Text } from 'react-native'
import React from 'react'
import Colors from '../Shared/Colors'


export default function SubHeading({subHeadingTitle}) {
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
            fontFamily: 'Inter-Black-Semi'
        }}>{subHeadingTitle}</Text>
        <Text style={{ fontFamily: 'Inter-Black', color: Colors.PRIMARY }}>view all</Text>
    </View>
  )
}