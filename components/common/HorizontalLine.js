import React from 'react';
import { View, Text } from 'react-native';
import Colors from '../Shared/Colors';


const HorizontalLine = () => {
    return (
        <View style={{
            borderWidth: 1, borderColor: Colors.PRIMARY, margin: 5, marginBottom: 15, marginTop: 15
        }}>

        </View>
    );
}

export default HorizontalLine;
