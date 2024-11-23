import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'

const DoctorsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prescriptions</Text>
        <Text style={styles.item}>Prescription 1: Take 1 tablet daily</Text>
        <Text style={styles.item}>Prescription 2: Apply ointment twice a day</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnosis</Text>
        <Text style={styles.item}>Diagnosis 1: Hypertension</Text>
        <Text style={styles.item}>Diagnosis 2: Diabetes</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lab Reports</Text>
        <Text style={styles.item}>Lab Report 1: Blood Test - Normal</Text>
        <Text style={styles.item}>Lab Report 2: X-Ray - No issues</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Consultations/Appointments</Text>
        <Text style={styles.item}>Consultation 1: Dr. Smith - 12th Oct</Text>
        <Text style={styles.item}>Consultation 2: Dr. Jane - 15th Oct</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feeds</Text>
        <Text style={styles.item}>Health Tip 1: Drink plenty of water</Text>
        <Text style={styles.item}>Article 1: Benefits of regular exercise</Text>
      </View>
    </ScrollView>
  )
}

export default DoctorsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    marginBottom: 5,
  },
})