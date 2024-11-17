import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { TextInput, Button, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Colors from '@/components/Shared/Colors';

const ExperienceInfo = ({ prevStep, nextStep, experienceData, onExperienceDataChange }) => {
  const [experience, setExperience] = useState(experienceData);

  const handleChange = (field, value) => {
    const updatedExperience = { ...experience, [field]: value };
    setExperience(updatedExperience);
    onExperienceDataChange(updatedExperience);
  };

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

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
        outlineColor="#1E90FF"
        activeOutlineColor="#1E90FF"
      />
      
      <Text style={styles.label}>Organization</Text>
      <TextInput
        mode="outlined"
        style={styles.input}
        value={experience.organization}
        onChangeText={(text) => handleChange('organization', text)}
        placeholder="Enter your organization"
        outlineColor="#1E90FF"
        activeOutlineColor="#1E90FF"
      />
      
      <Text style={styles.label}>Start Year</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={experience.startDate || ''}
          onValueChange={(value) => handleChange('startDate', value)}
          style={styles.picker}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year.toString()} value={year.toString()} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>End Year</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={experience.endDate || ''}
          onValueChange={(value) => handleChange('endDate', value)}
          style={styles.picker}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year.toString()} value={year.toString()} />
          ))}
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={prevStep} style={styles.button}>
          Previous
        </Button>
        <Button mode="contained" onPress={nextStep} style={styles.button}>
          Next
        </Button>
      </View>
    </View>
  );
};

export default ExperienceInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40, 
    backgroundColor: Colors.ligh_gray,
  },
  input:{
    borderColor: Colors.SECONDARY,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center', 
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },

  pickerContainer: {
    borderColor: '#1E90FF',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%', 
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: '#1E90FF',
  },
});

