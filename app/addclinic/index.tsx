import { StyleSheet, Text, View, Button, Alert } from 'react-native'; 
import React, { useState } from 'react';
import { useSelector } from 'react-redux'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PersonalInfo from './PersonalInfo';
import ClinicInfo from './ClinicInfo';
import EducationInfo from './EducationInfo';
import Review from './Review';
import { selectUser } from '../store/userSlice'; 
import Colors from '@/components/Shared/Colors';

const Index = () => {
  const [step, setStep] = useState(1);
  const [personalData, setPersonalData] = useState({});
  const [clinicData, setClinicData] = useState({});
  const [educationData, setEducationData] = useState({});
  const navigation = useNavigation();

  const user = useSelector(selectUser); 
  const professionalId = user?.professional?._id; 

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handlePersonalDataChange = (data) => {
    setPersonalData(data);
  };

  const handleClinicDataChange = (data) => {
    console.log('Updated Clinic Data in Index:', data);
    setClinicData(data);
  };

  const handleEducationDataChange = (data) => {
    setEducationData(data);
  };

  const submit = async (payload) => {
    try {
      const { images, ...clinicDataWithoutImages } = payload.clinicData;
      console.log('Clinic Data before submission:', clinicDataWithoutImages);
      const response = await fetch(`http://localhost:3000/api/clinics/register/${professionalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: clinicDataWithoutImages.name,
          contactInfo: clinicDataWithoutImages.contactInfo,
          address: clinicDataWithoutImages.address,
          insuranceCompanies: clinicDataWithoutImages.insuranceCompanies,
          specialties: clinicDataWithoutImages.specialties,
          education: payload.educationData,
          languages: clinicDataWithoutImages.languages,
          assistantName: clinicDataWithoutImages.assistantName,
          assistantPhone: clinicDataWithoutImages.assistantPhone,
          bio: clinicDataWithoutImages.bio,
          certificateUrl: payload.educationData.certificateUrl,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Clinic registered successfully:', data);
        Alert.alert('Success', 'Clinic registered successfully', [
          { text: 'OK', onPress: () => navigation.navigate('Professional') }
        ]);
        
        setStep(1);
        setPersonalData({});
        setClinicData({});
        setEducationData({});
      } else {
        console.error('Error registering clinic:', data);
        Alert.alert('Error', 'Error registering clinic');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <PersonalInfo
          nextStep={nextStep}
          personalData={personalData}
          onPersonalDataChange={handlePersonalDataChange}
        />
      )}
      {step === 2 && (
        <EducationInfo
          prevStep={prevStep}
          nextStep={nextStep}
          educationData={educationData}
          onEducationDataChange={handleEducationDataChange}
        />
      )}
      {step === 3 && (
        <ClinicInfo
          prevStep={prevStep}
          nextStep={nextStep}
          clinicData={clinicData}
          onClinicDataChange={handleClinicDataChange}
          professionalId={professionalId}
        />
      )}
      {step === 4 && (
        <Review
          prevStep={prevStep}
          personalData={personalData}
          clinicData={clinicData}
          educationData={educationData}
          submit={submit}
        />
      )}
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.ligh_gray,
  },
});
