import { StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import { Card, Title, Paragraph, Button } from 'react-native-paper'

const Review = ({ personalData, clinicData, experienceData, educationData, prevStep, submit }) => {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Review Information</Title>
          <Paragraph>Name: {personalData.name}</Paragraph>
          <Paragraph>Contact Info: {personalData.contactInfo}</Paragraph>
          <Paragraph>Address: {personalData.address}</Paragraph>
          <Paragraph>Email: {personalData.email}</Paragraph>
          <Paragraph>Bio: {personalData.bio}</Paragraph>
          <Paragraph>Clinic Name: {clinicData.clinicName}</Paragraph>
          <Paragraph>Clinic Address: {clinicData.address}</Paragraph>
          <Paragraph>Insurance Companies: {clinicData.insuranceCompanies}</Paragraph>
          <Paragraph>Specialties: {clinicData.specialties}</Paragraph>
          <Paragraph>Assistant Name: {clinicData.assistantName}</Paragraph>
          <Paragraph>Assistant Phone: {clinicData.assistantPhone}</Paragraph>
          <Paragraph>Education: {educationData.course} at {educationData.university}, {educationData.year}</Paragraph>
          <Paragraph>Languages: {clinicData.languages}</Paragraph>
          <Paragraph>Experience: {experienceData.title} at {experienceData.organization}, {experienceData.year}</Paragraph>
        </Card.Content>
      </Card>
      <Button mode="contained" onPress={prevStep} style={styles.button}>Back</Button>
      <Button mode="contained" onPress={submit} style={styles.button}>Submit</Button>
    </ScrollView>
  )
}

export default Review

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
})
