import { StyleSheet, Text, View, Button } from 'react-native'
import React, { useState } from 'react'
import PersonalInfo from './PersonalInfo'
import ClinicInfo from './ClinicInfo'
import ExperienceInfo from './ExperienceInfo'
import EducationInfo from './EducationInfo'
import Review from './Review'

const Index = () => {
  const [step, setStep] = useState(1)
  const [personalData, setPersonalData] = useState({})
  const [clinicData, setClinicData] = useState({})
  const [experienceData, setExperienceData] = useState({})
  const [educationData, setEducationData] = useState({})

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handlePersonalDataChange = (data) => {
    setPersonalData(data)
  }

  const handleClinicDataChange = (data) => {
    setClinicData(data)
  }

  const handleExperienceDataChange = (data) => {
    setExperienceData(data)
  }

  const handleEducationDataChange = (data) => {
    setEducationData(data)
  }

  const submit = () => {
    // Handle form submission
    console.log({ personalData, clinicData, experienceData, educationData })
  }

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
  )
}

export default Index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})