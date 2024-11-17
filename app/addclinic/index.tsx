import { StyleSheet, Text, View, Button } from 'react-native'; 
import React, { useState } from 'react';
import { useSelector } from 'react-redux'; 
import PersonalInfo from './PersonalInfo';
import ClinicInfo from './ClinicInfo';
import ExperienceInfo from './ExperienceInfo';
import EducationInfo from './EducationInfo';
import Review from './Review';
import { selectUser } from '../store/userSlice'; 

const Index = () => {
  const [step, setStep] = useState(1);
  const [personalData, setPersonalData] = useState({});
  const [clinicData, setClinicData] = useState({});
  const [experienceData, setExperienceData] = useState({});
  const [educationData, setEducationData] = useState({});

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
    console.log(data);
    setClinicData(data);
  };

  const handleExperienceDataChange = (data) => {
    setExperienceData(data);
  };

  const handleEducationDataChange = (data) => {
    setEducationData(data);
  };

  const submit = async (payload) => {
    try {
      console.log('Clinic Data before submission:', payload.clinicData); 
      const response = await fetch(`https://medplus-health.onrender.com/api/clinics/register/${professionalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: payload.clinicData.name,
          contactInfo: payload.clinicData.contactInfo,
          address: payload.clinicData.address,
          insuranceCompanies: payload.clinicData.insuranceCompanies,
          specialties: payload.clinicData.specialties,
          education: payload.educationData,
          experiences: payload.experienceData,
          languages: payload.clinicData.languages,
          assistantName: payload.clinicData.assistantName,
          assistantPhone: payload.clinicData.assistantPhone,
          bio: payload.clinicData.bio,
          certificateUrl: payload.educationData.certificateUrl,
          images: payload.clinicData.images || [], 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Clinic registered successfully:', data);
        
      } else {
        console.error('Error registering clinic:', data);
       
      }
    } catch (error) {
      console.error('Error:', error);
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
        <ClinicInfo
          prevStep={prevStep}
          nextStep={nextStep}
          clinicData={clinicData}
          onClinicDataChange={handleClinicDataChange}
        />
      )}
      {step === 5 && (
        <Review
          prevStep={prevStep}
          personalData={personalData}
          clinicData={clinicData}
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
  },
});
