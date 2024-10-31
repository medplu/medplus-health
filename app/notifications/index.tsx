// app/notifications/index.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectNotifications } from '../store/appointmentsSlice'; // Import the notifications selector

const Notifications = () => {
  // Retrieve notifications from Redux state
  const notifications = useSelector(selectNotifications);

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>
        {item.message} {/* Customize the message based on your notification structure */}
      </Text>
      <Text style={styles.dateText}>{item.date}</Text> {/* Customize based on your notification structure */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()} // Adjust based on your notification structure
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  notificationText: {
    fontSize: 18,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
});

export default Notifications;
