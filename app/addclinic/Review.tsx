import { StyleSheet, ScrollView, View, Image } from 'react-native'
import React from 'react'
import { Card, Title, Paragraph, Button, Divider } from 'react-native-paper'

const Review = ({ personalData, clinicData, experienceData, educationData, prevStep, submit }) => {
  const handleSubmit = () => {
    console.log('Clinic Data:', clinicData); // Log clinicData to inspect its structure
    const payload = {
      personalData,
      clinicData: {
        ...clinicData,
        images: Array.isArray(clinicData.images) ? clinicData.images.map(image => image.uri || image.url || image.secure_url) : [],
      },
      experienceData,
      educationData,
    };
    submit(payload);
  };

  return (
    <ScrollView style={styles.container}>
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
      <Divider style={styles.divider} />
      <Card style={styles.card}>
        <Card.Content>
          <Title>Experience</Title>
          <Paragraph>{Array.isArray(experienceData) ? experienceData.map(exp => `${exp.position} at ${exp.organization}, ${exp.startDate} - ${exp.endDate}`).join('; ') : ''}</Paragraph>
        </Card.Content>
      </Card>
      <Divider style={styles.divider} />
      <Card style={styles.card}>
        <Card.Content>
          <Title>Images</Title>
          <View style={styles.imageContainer}>
            {clinicData.images && clinicData.images.map((image, index) => (
              <Image key={index} source={{ uri: image.uri || image.url || image.secure_url }} style={styles.image} />
            ))}
          </View>
        </Card.Content>
      </Card>
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={prevStep} style={styles.button}>Back</Button>
        <Button mode="contained" onPress={handleSubmit} style={styles.button}>Submit</Button>
      </View>
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
  divider: {
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  button: {
    marginHorizontal: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    width: 100,
    height: 100,
    margin: 4,
  },
})
