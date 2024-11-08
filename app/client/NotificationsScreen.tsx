import React, { useState } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import useAppointments from '../../hooks/useAppointments' 

const NotificationsScreen = () => {
  const { appointments = [], loading, error } = useAppointments()
  const router = useRouter()

  const handleViewAppointment = (appointmentId: string) => {
    router.push(`/appointment/${appointmentId}`)
  }

  const renderNotificationItem = ({ item }) => {
    const doctor = item.doctorId || {}
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleViewAppointment(item._id)}>
        <Image source={{ uri: doctor.profileImage }} style={styles.image} />
        <View style={styles.cardContent}>
          <Text style={styles.name}>Dr. {doctor.firstName || 'N/A'} {doctor.lastName || 'N/A'}</Text>
          <Text style={styles.count}>{item.status}</Text>
          <Text style={styles.time}>{item.time}</Text>
          <TouchableOpacity
            style={styles.followButton}
            onPress={() => handleViewAppointment(item._id)}
          >
            <Text style={styles.followButtonText}>View Appointment</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointments</Text>
      {appointments.length === 0 ? (
        <Text style={styles.emptyText}>No appointments available.</Text>
      ) : (
        <FlatList
          style={styles.contentList}
          data={appointments}
          keyExtractor={item => item._id.toString()}
          renderItem={renderNotificationItem}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#ebf0f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  contentList: {
    flex: 1,
  },
  card: {
    shadowColor: '#00000021',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    borderRadius: 30,
  },
  cardContent: {
    marginLeft: 20,
    marginTop: 10,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#ebf0f7',
  },
  name: {
    fontSize: 18,
    flex: 1,
    alignSelf: 'center',
    color: '#3399ff',
    fontWeight: 'bold',
  },
  count: {
    fontSize: 14,
    flex: 1,
    alignSelf: 'center',
    color: '#6666ff',
  },
  time: {
    fontSize: 14,
    flex: 1,
    alignSelf: 'center',
    color: '#ff6347',
  },
  followButton: {
    marginTop: 10,
    height: 35,
    width: 150,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#007BFF',
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
  },
})

export default NotificationsScreen
