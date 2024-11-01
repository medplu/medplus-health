import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectNotifications } from '@/app/store/appointmentsSlice';

const NotificationsScreen = () => {
  const notifications = useSelector(selectNotifications); // Fetch notifications from Redux

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.patientName}>{item.patientName}</Text>
      <Text style={styles.appointmentDetails}>{`${item.date} at ${item.time}`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No new notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    fontSize: 14,
    color: '#555',
  },
  noNotifications: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
});

export default NotificationsScreen;
