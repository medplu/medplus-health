import { StyleSheet, ScrollView, View } from 'react-native';
import React from 'react';
import { Card, Title, Paragraph, Button, Divider } from 'react-native-paper';
import Colors from '@/components/Shared/Colors';

const Review = ({ personalData, clinicData, educationData, prevStep, submit }) => {
  const handleSubmit = () => {
    const payload = {
      personalData,
      clinicData,
      educationData,
    };
    submit(payload);
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.contentContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Personal Information</Title>
            <Paragraph>Name: {personalData.name}</Paragraph>
            <Paragraph>Contact Info: {personalData.contactInfo}</Paragraph>
            <Paragraph>Address: {personalData.address}</Paragraph>
            <Paragraph>Email: {personalData.email}</Paragraph>
            <Paragraph>Bio: {personalData.bio}</Paragraph>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <Card style={styles.card}>
          <Card.Content>
            <Title>Clinic Information</Title>
            <Paragraph>Clinic Name: {clinicData.name}</Paragraph>
            <Paragraph>Clinic Address: {clinicData.address}</Paragraph>
            <Paragraph>Insurance Companies: {Array.isArray(clinicData.insuranceCompanies) ? clinicData.insuranceCompanies.join(', ') : clinicData.insuranceCompanies}</Paragraph>
            <Paragraph>Specialties: {clinicData.specialties}</Paragraph>
            <Paragraph>Assistant Name: {clinicData.assistantName}</Paragraph>
            <Paragraph>Assistant Phone: {clinicData.assistantPhone}</Paragraph>
            <Paragraph>Languages: {clinicData.languages}</Paragraph>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <Card style={styles.card}>
          <Card.Content>
            <Title>Education</Title>
            <Paragraph>{educationData.course} at {educationData.university}, {educationData.year}</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={prevStep} style={styles.button}>Back</Button>
        <Button mode="contained" onPress={handleSubmit} style={styles.button}>Submit</Button>
      </View>
    </ScrollView>
  );
};

export default Review;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: Colors.ligh_gray,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 3,
  },
  divider: {
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  button: {
    marginHorizontal: 8,
    flex: 1,
    justifyContent: 'center',
  },
});
