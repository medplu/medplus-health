import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { TextInput, Button, Text } from 'react-native-paper'

const ExperienceInfo = ({ prevStep, nextStep, experienceData, onExperienceDataChange }) => {
  const [experience, setExperience] = useState(experienceData)

  const handleChange = (field, value) => {
    const updatedExperience = { ...experience, [field]: value }
    setExperience(updatedExperience)
    onExperienceDataChange(updatedExperience)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        mode="outlined"
        style={styles.input}
        value={experience.position}
        onChangeText={(text) => handleChange('position', text)}
        placeholder="Enter your title"
      />
      <Text style={styles.label}>Organization</Text>
      <TextInput
        mode="outlined"
        style={styles.input}
        value={experience.organization}
        onChangeText={(text) => handleChange('organization', text)}
        placeholder="Enter your organization"
      />
      <Text style={styles.label}>Start Year</Text>
      <TextInput
        mode="outlined"
        style={styles.input}
        value={experience.startDate}
        onChangeText={(text) => handleChange('startDate', text)}
        placeholder="Enter the start year"
      />
      <Text style={styles.label}>End Year</Text>
      <TextInput
        mode="outlined"
        style={styles.input}
        value={experience.endDate}
        onChangeText={(text) => handleChange('endDate', text)}
        placeholder="Enter the end year (if applicable)"
      />
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={prevStep} style={styles.button}>Previous</Button>
        <Button mode="contained" onPress={nextStep} style={styles.button}>Next</Button>
      </View>
    </View>
  )
}

export default ExperienceInfo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    marginHorizontal: 5,
  },
})