import { StyleSheet, Text, View, Image, FlatList } from 'react-native'
import React from 'react'
import useAppointments from '@/hooks/useAppointments' // Added import

const index = () => {
  const { appointments } = useAppointments() // Access appointments
  console.log('Appointments Data:', appointments) // Added log

  const renderAppointment = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: 'https://example.com/avatar.png' }} // Predefined avatar
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.patientName}</Text>
        <Text style={styles.email}>{item.patientId.email}</Text>
      </View>
    </View>
  )

  return (
    <View>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        renderItem={renderAppointment}
      />
    </View>
  )
}

export default index

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
})