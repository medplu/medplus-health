import { StyleSheet, Text, View, Button, Alert } from 'react-native'; 
import React, { useState } from 'react';
import { useSelector } from 'react-redux'; 
import { useNavigation } from '@react-navigation/native';
import PersonalInfo from './PersonalInfo';
import PharmacyInfo from './PharmacyInfo';
import ExperienceInfo from './ExperienceInfo';
import EducationInfo from './EducationInfo';
import Review from './Review';
import { selectUser } from '../store/userSlice'; 
import Colors from '@/components/Shared/Colors';


const Index = () => {
  const [step, setStep] = useState(1);
  const [personalData, setPersonalData] = useState({});
  const [pharmacyData, setPharmacyData] = useState({});
  const [experienceData, setExperienceData] = useState({});
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

  const handlePharmacyDataChange = (data) => {
    console.log(data);
    setPharmacyData(data);
  };

  const handleExperienceDataChange = (data) => {
    setExperienceData(data);
  };

  const handleEducationDataChange = (data) => {
    setEducationData(data);
  };

  const submit = async (payload) => {
    try {
      console.log('Pharmacy Data before submission:', payload.pharmacyData); 
      const response = await fetch(`https://medplus-health.onrender.com/api/pharmacies/${professionalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: payload.pharmacyData.name,
          contactInfo: payload.pharmacyData.contactInfo,
          address: payload.pharmacyData.address,
          insuranceCompanies: payload.pharmacyData.insuranceCompanies,
          specialties: payload.pharmacyData.specialties,
          education: payload.educationData,
          experiences: payload.experienceData,
          languages: payload.pharmacyData.languages,
          assistantName: payload.pharmacyData.assistantName,
          assistantPhone: payload.pharmacyData.assistantPhone,
          bio: payload.pharmacyData.bio,
          certificateUrl: payload.educationData.certificateUrl,
          images: payload.pharmacyData.images || [], 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Pharmacy registered successfully:', data);
        Alert.alert('Success', 'Pharmacy registered successfully', [
          { text: 'OK', onPress: () => navigation.navigate('/professional') }
        ]);
        // Reset the form
        setStep(1);
        setPersonalData({});
        setPharmacyData({});
        setExperienceData({});
        setEducationData({});
      } else {
        console.error('Error registering pharmacy:', data);
        Alert.alert('Error', 'Error registering pharmacy');
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
        <ExperienceInfo
          prevStep={prevStep}
          nextStep={nextStep}
          experienceData={experienceData}
          onExperienceDataChange={handleExperienceDataChange}
        />
      )}
      {step === 4 && (
        <PharmacyInfo
          prevStep={prevStep}
          nextStep={nextStep}
          pharmacyData={pharmacyData}
          onPharmacyDataChange={handlePharmacyDataChange}
        />
      )}
      {step === 5 && (
        <Review
          prevStep={prevStep}
          personalData={personalData}
          pharmacyData={pharmacyData}
          experienceData={experienceData}
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
