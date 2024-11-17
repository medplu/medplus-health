import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { TextInput, Button, Text } from 'react-native-paper'
import { Picker } from '@react-native-picker/picker'

const ExperienceInfo = ({ prevStep, nextStep, experienceData, onExperienceDataChange }) => {
  const [experience, setExperience] = useState(experienceData)

  const handleChange = (field, value) => {
    const updatedExperience = { ...experience, [field]: value }
    setExperience(updatedExperience)
    onExperienceDataChange(updatedExperience)
  }

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Experience</Text>
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
      <Picker
        selectedValue={experience.startDate || ''}
        onValueChange={(value) => handleChange('startDate', value)}
        style={styles.input}
      >
        {years.map((year) => (
          <Picker.Item key={year} label={year.toString()} value={year.toString()} />
        ))}
      </Picker>
      <Text style={styles.label}>End Year</Text>
      <Picker
        selectedValue={experience.endDate || ''}
        onValueChange={(value) => handleChange('endDate', value)}
        style={styles.input}
      >
        {years.map((year) => (
          <Picker.Item key={year} label={year.toString()} value={year.toString()} />
        ))}
      </Picker>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
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