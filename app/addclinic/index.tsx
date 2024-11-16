import { StyleSheet, Text, View, Button } from 'react-native';
import React, { useState } from 'react';
import { useSelector } from 'react-redux'; // Import useSelector from react-redux
import PersonalInfo from './PersonalInfo';
import ClinicInfo from './ClinicInfo';
import ExperienceInfo from './ExperienceInfo';
import EducationInfo from './EducationInfo';
import Review from './Review';
import { selectUser } from '../store/userSlice'; // Import the selector

const Index = () => {
  const [step, setStep] = useState(1);
  const [personalData, setPersonalData] = useState({});
  const [clinicData, setClinicData] = useState({});
  const [experienceData, setExperienceData] = useState({});
  const [educationData, setEducationData] = useState({});

  const user = useSelector(selectUser); // Use the selector to get the user
  const professionalId = user?.professional?._id; // Extract the professionalId

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
    setClinicData(data);
  };

  const handleExperienceDataChange = (data) => {
    setExperienceData(data);
  };

  const handleEducationDataChange = (data) => {
    setEducationData(data);
  };

  const submit = async () => {
    try {
      const response = await fetch(`https://medplus-health.onrender.com/api/clinics/register/${professionalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: clinicData.name,
          contactInfo: clinicData.contactInfo,
          address: clinicData.address,
          image: clinicData.image,
          insuranceCompanies: clinicData.insuranceCompanies,
          specialties: clinicData.specialties,
          education: {
            course: educationData.course,
            university: educationData.university,
            country: educationData.country,
            year: educationData.year,
          },
          experiences: experienceData.map(exp => ({
            position: exp.position,
            organization: exp.organization,
            startDate: exp.startDate,
            endDate: exp.endDate,
            currentlyWorking: exp.currentlyWorking,
          })),
          languages: clinicData.languages,
          assistantName: clinicData.assistantName,
          assistantPhone: clinicData.assistantPhone,
          bio: clinicData.bio,
          certificateUrl: educationData.certificateUrl,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Form submitted successfully:', data);
      } else {
        console.error('Error submitting form:', data);
      }
    } catch (error) {
      console.error('Error during form submission:', error);
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