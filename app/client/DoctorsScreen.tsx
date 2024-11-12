import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import DoctorCardItem from '../../components/common/DoctorCardItem'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const DoctorsScreen = () => {
  const [favoriteDoctors, setFavoriteDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    const fetchFavoriteDoctors = async () => {
      try {
        const token = await AsyncStorage.getItem('token')
        const response = await axios.get('https://yourapi.com/api/users/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setFavoriteDoctors(response.data.favoriteDoctors)
      } catch (error) {
        console.error("Error fetching favorite doctors:", error)
      }
    }

    fetchFavoriteDoctors()
  }, [])

  return (
    <View style={styles.container}>
      {favoriteDoctors.length === 0 ? (
        <Text style={styles.emptyText}>No favorite doctors added.</Text>
      ) : (
        <FlatList
          data={favoriteDoctors}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <DoctorCardItem doctor={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  )
}

export default DoctorsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  list: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
})