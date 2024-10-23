// app/professional/components/PatientAnalysis.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/components/Shared/Colors';

const PatientAnalysis: React.FC = () => {
  // Dummy data
  const newClientsPercentage = 40;
  const returningClientsPercentage = 60;
  const malePatientsPercentage = 55;
  const femalePatientsPercentage = 45;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Analysis</Text>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <MaterialIcons name="person-add" size={40} color={Colors.primary} />
          <Text style={styles.cardTitle}>New Clients</Text>
          <Text style={styles.cardValue}>{newClientsPercentage}%</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="repeat" size={40} color={Colors.secondary} />
          <Text style={styles.cardTitle}>Returning Clients</Text>
          <Text style={styles.cardValue}>{returningClientsPercentage}%</Text>
        </View>
      </View>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <MaterialIcons name="male" size={40} color={Colors.primary} />
          <Text style={styles.cardTitle}>Male Patients</Text>
          <Text style={styles.cardValue}>{malePatientsPercentage}%</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="female" size={40} color={Colors.secondary} />
          <Text style={styles.cardTitle}>Female Patients</Text>
          <Text style={styles.cardValue}>{femalePatientsPercentage}%</Text>
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

export default PatientAnalysis;// app/professional/components/PatientAnalysis.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/components/Shared/Colors';

const PatientAnalysis: React.FC = () => {
  // Dummy data
  const newClientsPercentage = 40;
  const returningClientsPercentage = 60;
  const malePatientsPercentage = 55;
  const femalePatientsPercentage = 45;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Analysis</Text>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <MaterialIcons name="person-add" size={40} color={Colors.primary} />
          <Text style={styles.cardTitle}>New Clients</Text>
          <Text style={styles.cardValue}>{newClientsPercentage}%</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="repeat" size={40} color={Colors.secondary} />
          <Text style={styles.cardTitle}>Returning Clients</Text>
          <Text style={styles.cardValue}>{returningClientsPercentage}%</Text>
        </View>
      </View>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <MaterialIcons name="male" size={40} color={Colors.primary} />
          <Text style={styles.cardTitle}>Male Patients</Text>
          <Text style={styles.cardValue}>{malePatientsPercentage}%</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="female" size={40} color={Colors.secondary} />
          <Text style={styles.cardTitle}>Female Patients</Text>
          <Text style={styles.cardValue}>{femalePatientsPercentage}%</Text>
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

export default PatientAnalysis;