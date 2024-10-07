import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

export default function ClinicDoctorTab({activeTab}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
        <TouchableOpacity 
        style={[
          activeIndex === 0
           ?styles.activeTab
           :styles.inactiveTab
        ]}
        onPress={() => {setActiveIndex(0);activeTab('Clinics')}}>  
        
          <Text 
          style={[
            activeIndex === 0
            ?styles.activeTab
            :styles.inactiveTab
          ]}>Clinics</Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={[
          activeIndex === 1
          ?styles.activeTab
          :styles.inactiveTab
        ]}
         onPress={() => {setActiveIndex(1);activeTab('Doctors')}}>
          <Text style={[
            activeIndex === 1
            ?styles.activeTab
            :styles.inactiveTab
          ]}>Doctors</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  activeTab: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
    paddingBottom: 5,
  },
  inactiveTab: {
    fontSize: 18,
    fontWeight: 'normal',
    color: 'gray',
    paddingBottom: 5,
  },
};