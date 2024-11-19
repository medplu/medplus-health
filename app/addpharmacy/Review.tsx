import { StyleSheet, ScrollView, View, Image } from 'react-native';
import React from 'react';
import { Card, Title, Paragraph, Button, Divider } from 'react-native-paper';
import Colors from '@/components/Shared/Colors';

const Review = ({ personalData, pharmacyData, experienceData, educationData, prevStep, submit }) => {
  const handleSubmit = () => {
    const payload = {
      personalData,
      pharmacyData: {
        ...pharmacyData,
        images: Array.isArray(pharmacyData.images) ? pharmacyData.images.map(image => image.uri || image.url || image.secure_url) : [],
      },
      experienceData,
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
            <Title>Pharmacy Information</Title>
            <Paragraph>Pharmacy Name: {pharmacyData.name}</Paragraph>
            <Paragraph>Pharmacy Address: {pharmacyData.address?.street}, {pharmacyData.address?.city}, {pharmacyData.address?.state}, {pharmacyData.address?.zipCode}</Paragraph>
            <Paragraph>Insurance Companies: {Array.isArray(pharmacyData.insuranceCompanies) ? pharmacyData.insuranceCompanies.join(', ') : pharmacyData.insuranceCompanies}</Paragraph>
            <Paragraph>Specialties: {pharmacyData.specialties}</Paragraph>
            <Paragraph>Assistant Name: {pharmacyData.assistantName}</Paragraph>
            <Paragraph>Assistant Phone: {pharmacyData.assistantPhone}</Paragraph>
            <Paragraph>Languages: {pharmacyData.languages}</Paragraph>
            <Paragraph>Operating Hours: {pharmacyData.operatingHours?.open} - {pharmacyData.operatingHours?.close}</Paragraph>
            <Paragraph>License Number: {pharmacyData.licenseNumber}</Paragraph>
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
              {pharmacyData.images && pharmacyData.images.map((image, index) => (
                <Image key={index} source={{ uri: image.uri || image.url || image.secure_url }} style={styles.image} />
              ))}
            </View>
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
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
  },
});
