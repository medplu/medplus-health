import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, ScrollView, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { MaterialIcons } from '@expo/vector-icons';
import AddClinicForm from '../../components/AddClinicForm';
import Colors from '@/components/Shared/Colors';
import CreatePharmacy from '@/components/CreatePharmacy';
import useAppointments from '../../hooks/useAppointments';
import AppointmentOverview from '../../components/AppointmentOverview';
import JoinClinicForm from '../../components/JoinClinicForm';

interface Day {
  label: string;
  date: string;
  isToday: boolean;
}

const DashboardScreen: React.FC = () => {
  const { appointments, recentAppointments, loading, confirmAppointment } = useAppointments();
  const [showAllRecentAppointments, setShowAllRecentAppointments] = useState<boolean>(false);
  const totalAppointments = appointments.length + recentAppointments.length;
  const completedAppointments = recentAppointments.length;
  const upcomingAppointments = appointments.length;
  const requestAppointments = totalAppointments - completedAppointments - upcomingAppointments;
  const [showAddClinicForm, setShowAddClinicForm] = useState(false);
  const [showCreatePharmacyForm, setShowCreatePharmacyForm] = useState(false);
  const [showJoinClinicForm, setShowJoinClinicForm] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [isAttachedToClinic, setIsAttachedToClinic] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const id = await AsyncStorage.getItem('professionalId');
      const attachedToClinic = await AsyncStorage.getItem('attachedToClinic');
      setProfessionalId(id);
      setIsAttachedToClinic(attachedToClinic === 'true');
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  const handleAddPharmacyClick = () => {
    setShowCreatePharmacyForm(true);
  };

  const handleClosePharmacyForm = () => {
    setShowCreatePharmacyForm(false);
  };

  const handleAddClinicClick = () => {
    setShowAddClinicForm(true);
  };

  const handleCloseClinicForm = () => {
    setShowAddClinicForm(false);
  };

  const handleJoinClinicClick = () => {
    setShowJoinClinicForm(true);
  };

  const handleCloseJoinClinicForm = () => {
    setShowJoinClinicForm(false);
  };

  const today = moment();
  const startOfWeek = today.startOf('isoWeek');

  const days: Day[] = [];
  for (let i = 0; i < 7; i++) {
    const day = startOfWeek.clone().add(i, 'days');
    days.push({
      label: day.format('ddd'),
      date: day.format('DD'),
      isToday: day.isSame(today, 'day'),
    });
  }

  if (loading || isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAttachedToClinic) {
    return (
      <View style={styles.promptContainer}>
        <Text style={styles.promptText}>
          Please create or join a clinic to proceed with your professional activities.
        </Text>
        <Button title="Create Clinic" onPress={handleAddClinicClick} />
        <Button title="Join Existing Clinic" onPress={handleJoinClinicClick} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <FlatList
        data={days}
        horizontal
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <View style={styles.dayContainer}>
            <Text style={[styles.dayLabel, item.isToday && styles.todayText]}>{item.label}</Text>
            <Text style={[styles.dateLabel, item.isToday && styles.todayText]}>{item.date}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={handleAddClinicClick}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="add" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.details}>Add Clinic</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={handleAddPharmacyClick}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="local-pharmacy" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.details}>Add Pharmacy</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="folder" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.details}>Patient Records</Text>
        </View>
      </View>

      <AppointmentOverview
        totalAppointments={totalAppointments}
        completedAppointments={completedAppointments}
        upcomingAppointments={upcomingAppointments}
        requestAppointments={requestAppointments}
      />

      <Text style={styles.subtitle}>Recent Appointments</Text>
      {recentAppointments.length > 0 ? (
        <FlatList
          data={showAllRecentAppointments ? recentAppointments : recentAppointments.slice(0, 5)}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              <Image source={{ uri: item.patientImage }} style={styles.patientImage} />
              <View style={styles.detailsContainer}>
                <Text style={styles.name}>{item.patientName}</Text>
                <Text style={styles.dateTime}>
                  {moment(item.date).format('MMMM Do, YYYY')} - {item.time}
                </Text>
              </View>
              {item.status !== 'confirmed' && (
                <Button title="Confirm" onPress={() => confirmAppointment(item._id)} />
              )}
            </View>
          )}
          ListFooterComponent={
            recentAppointments.length > 5 && (
              <TouchableOpacity onPress={() => setShowAllRecentAppointments((prev) => !prev)}>
                <Text style={styles.showMoreText}>
                  {showAllRecentAppointments ? 'Show Less' : 'Show All'}
                </Text>
              </TouchableOpacity>
            )
          }
        />
      ) : (
        <Text style={styles.noAppointmentsText}>No recent appointments.</Text>
      )}

      {/* Add Clinic Modal */}
      <Modal visible={showAddClinicForm} animationType="slide" onRequestClose={handleCloseClinicForm}>
        <AddClinicForm professionalId={professionalId} onClose={handleCloseClinicForm} />
      </Modal>

      {/* Create Pharmacy Modal */}
      <Modal visible={showCreatePharmacyForm} animationType="slide" onRequestClose={handleClosePharmacyForm}>
        <CreatePharmacy onClose={handleClosePharmacyForm} />
      </Modal>

      {/* Join Clinic Modal */}
      <Modal visible={showJoinClinicForm} animationType="slide" onRequestClose={handleCloseJoinClinicForm}>
        <JoinClinicForm onClose={handleCloseJoinClinicForm} />
      </Modal>
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: Colors.background,
  },
  promptContainer: {
    padding: 16,
    backgroundColor: Colors.warning,
    borderRadius: 8,
    marginBottom: 16,
  },
  promptText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  iconContainer: {
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  dayContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  dayLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  dateLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  todayText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  patientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  dateTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  noAppointmentsText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 16,
  },
  showMoreText: {
    textAlign: 'center',
    color: Colors.primary,
    marginTop: 8,
  },
});