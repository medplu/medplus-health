import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import FormData from 'form-data'; // Ensure this import is included

interface EducationInfoProps {
  prevStep: () => void;
  nextStep: () => void;
  educationData: {
    country?: string;
    year?: string;
    course?: string;
    university?: string;
    certificateUrl?: string;
  };
  onEducationDataChange: (data: any) => void;
  universities?: string[];
}

const EducationInfo: React.FC<EducationInfoProps> = ({ prevStep, nextStep, educationData, onEducationDataChange, universities = [] }) => {
  const [countries, setCountries] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState<{ id: number; name: string }[]>([]);
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
  const medicalCourses = [
    { id: 1, name: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)' },
    { id: 2, name: 'Bachelor of Dental Surgery (BDS)' },
    { id: 3, name: 'Bachelor of Ayurvedic Medicine and Surgery (BAMS)' },
    { id: 4, name: 'Bachelor of Homeopathic Medicine and Surgery (BHMS)' },
    { id: 5, name: 'Bachelor of Physiotherapy (BPT)' },
    { id: 6, name: 'Bachelor of Science in Nursing (B.Sc Nursing)' },
    { id: 7, name: 'Doctor of Pharmacy (Pharm.D)' },
    { id: 8, name: 'Bachelor of Medical Laboratory Technology (BMLT)' },
  ];

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then(response => response.json())
      .then(data => {
        const countryList = data.map((country: { name: { common: string }; cca2: string }) => ({
          label: country.name.common,
          value: country.cca2,
        }));
        setCountries(countryList);
      })
      .catch(error => console.error('Error fetching countries:', error));
  }, []);

  const handleChange = (key: string, value: any) => {
    onEducationDataChange({ ...educationData, [key]: value });
  };

  const handleCourseChange = (text: string) => {
    handleChange('course', text);
    if (text.length > 0) {
      const filtered = medicalCourses.filter(course => course.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  };

  const handleCourseSelect = (course: { id: number; name: string }) => {
    handleChange('course', course.name);
    setFilteredCourses([]);
  };
  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
  
      // Check if the file is selected
      if (result.type === 'success' && result.assets && result.assets.length > 0) {
        const file = result.assets[0];  // Access the first file from the assets array
  
        // Ensure the file has necessary properties
        if (file.uri && file.name && file.mimeType) {
          const formData = new FormData();
          formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
          });
  
          const response = await fetch('https://medplus-health.onrender.com/api/files/upload', {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  
          const data = await response.json();
          if (response.ok && data.fileUrl) {
            handleChange('certificateUrl', data.fileUrl);
            console.log('File uploaded successfully:', data.fileUrl);
          } else {
            console.error('Error uploading file:', data);
          }
        } else {
          console.error('File missing necessary properties (uri, name, type)');
        }
      } else {
        console.log('File selection was cancelled or file not found');
      }
    } catch (error) {
      console.error('Error during file selection/upload:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Education</Text>
      
      <Picker
        selectedValue={educationData.country || ''}
        onValueChange={(value) => handleChange('country', value)}
        style={styles.input}
      >
        {countries.map((country) => (
          <Picker.Item key={country.value} label={country.label} value={country.value} />
        ))}
      </Picker>

      <Picker
        selectedValue={educationData.year || ''}
        onValueChange={(value) => handleChange('year', value)}
        style={styles.input}
      >
        {years.map((year) => (
          <Picker.Item key={year} label={year.toString()} value={year.toString()} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        value={educationData.course || ''}
        onChangeText={handleCourseChange}
        placeholder="Enter course"
      />
      {filteredCourses.length > 0 && (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCourseSelect(item)}>
              <Text style={styles.suggestion}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TextInput
        style={styles.input}
        value={educationData.university || ''}
        onChangeText={(text) => handleChange('university', text)}
        placeholder="Enter university"
      />

      <TouchableOpacity style={styles.fileButton} onPress={handleFilePicker}>
        <MaterialIcons name="attach-file" size={24} color="black" />
        <Text style={styles.fileButtonText}>Add Certificate</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <Button title="Previous" onPress={prevStep} />
        <Button title="Next" onPress={nextStep} />
      </View>
    </View>
  );
};

export default EducationInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
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
  suggestion: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
});
