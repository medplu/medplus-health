// app/professional/components/AppointmentOverview.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/components/Shared/Colors';

interface AppointmentOverviewProps {
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  requestAppointments: number;
}

const AppointmentOverview: React.FC<AppointmentOverviewProps> = ({
  totalAppointments,
  completedAppointments,
  upcomingAppointments,
  requestAppointments,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointments Overview</Text>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <MaterialIcons name="event-note" size={40} color={Colors.primary} />
          <Text style={styles.cardTitle}>Total Appointments</Text>
          <Text style={styles.cardValue}>{totalAppointments}</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="event-available" size={40} color={Colors.secondary} />
          <Text style={styles.cardTitle}>Upcoming Appointments</Text>
          <Text style={styles.cardValue}>{upcomingAppointments}</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="event-busy" size={40} color={Colors.tertiary} />
          <Text style={styles.cardTitle}>Requests</Text>
          <Text style={styles.cardValue}>{requestAppointments}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.primary,
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default AppointmentOverview;