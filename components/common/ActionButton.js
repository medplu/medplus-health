import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../Shared/Colors';

const ActionButton = ({ location, contact }) => {
  const actionButtonList = [
    {
      id: 1,
      name: 'Email',
      icon: 'chatbubble-ellipses',
    },
    {
      id: 2,
      name: 'Phone',
      icon: 'call',
      value: contact,
    },
    {
      id: 3,
      name: 'Location',
      icon: 'location',
      value: location,
    },
    {
      id: 4,
      name: 'Share',
      icon: 'share-social-sharp',
    },
  ];

  return (
    <View>
      <FlatList
        data={actionButtonList}
        numColumns={4}
        key={`numColumns-${4}`} // Add a unique key based on the number of columns
        columnWrapperStyle={{
          flex: 1,
          justifyContent: 'space-between',
        }}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: Colors.SECONDARY,
                padding: 13,
                borderRadius: 99,
                alignItems: 'center',
                width: 55,
              }}
            >
              <Ionicons name={item.icon} size={26} color={Colors.primary} />
            </View>
            <Text style={{ fontFamily: 'Inter-Black-Semi', marginTop: 5 }}>
              {item.name}
            </Text>
            {item.value && (
              <Text style={{ fontFamily: 'Inter-Black-Semi', marginTop: 5 }}>
                {item.value}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ActionButton;
