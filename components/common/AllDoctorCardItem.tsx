// AllDoctorCardItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface DoctorCardProps {
  profileImage: string;
  firstName: string;
  lastName: string;
  profession: string;
}

const AllDoctorCardItem: React.FC<DoctorCardProps> = ({ profileImage, firstName, lastName, profession }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: profileImage }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
        <Text style={styles.profession}>{profession}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 3, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profession: {
    color: 'gray',
    marginTop: 4,
  },
});

export default AllDoctorCardItem;
