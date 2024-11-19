import { StyleSheet, View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import Colors from '@/components/Shared/Colors';
import { Text, Button } from 'react-native-elements';

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
    const fetchCountries = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
  
      try {
        const response = await fetch('https://restcountries.com/v3.1/all', { signal: controller.signal });
        const data = await response.json();
        const countryList = data.map((country: { name: { common: string }; cca2: string }) => ({
          label: country.name.common,
          value: country.cca2,
        }));
        setCountries(countryList);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('Fetch request timed out');
        } else {
          console.error('Error fetching countries:', error);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };
  
    fetchCountries();
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Education Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Country</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={educationData.country || ''}
            onValueChange={(value) => handleChange('country', value)}
            style={styles.picker}
          >
            {countries.map((country) => (
              <Picker.Item key={country.value} label={country.label} value={country.value} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Year</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={educationData.year || ''}
            onValueChange={(value) => handleChange('year', value)}
            style={styles.picker}
          >
            {years.map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year.toString()} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Course</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter course"
          value={educationData.course || ''}
          onChangeText={handleCourseChange}
        />
        {filteredCourses.length > 0 && (
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleCourseSelect(item)} style={styles.suggestion}>
                <Text style={styles.suggestionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <Text style={styles.label}>University</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter university"
          value={educationData.university || ''}
          onChangeText={(text) => handleChange('university', text)}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={prevStep}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={nextStep}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: Colors.ligh_gray,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  pickerContainer: {
    borderColor: Colors.SECONDARY,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picker: {
    width: '100%',
    height: 40,
  },
  input: {
    borderColor: Colors.SECONDARY,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  suggestion: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EducationInfo;
