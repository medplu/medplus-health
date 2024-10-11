import React from 'react';
import { View, FlatList } from 'react-native';
import DoctorCardItem from '../common/DoctorCardItem'; // Import ClinicCardItem from common

const DoctorList = ({ doctorList }) => {
  const renderItem = ({ item }) => {
    return (
      <View style={{ marginBottom: 20 }}>
        <DoctorCardItem doctor={item} />
      </View>
    );
  };

  const keyExtractor = (item, index) => {
    return item.id ? item.id.toString() : index.toString();
  };

  return (
    <FlatList
      data={doctorList}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
};

export default DoctorList;