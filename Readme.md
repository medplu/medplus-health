import { StyleSheet, View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import FormData from 'form-data'; 
import Colors from '@/components/Shared/Colors';
import { Text, Button, ListItem } from 'react-native-elements';



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

  const uploadFile = async (file: { uri: string; name: string; type: string }) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });
  
    try {
      const response = await fetch('https://medplus-health.onrender.com/api/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const data = await response.json();
      if (response.ok && data.fileUrl) {
        return data.fileUrl;
      } else {
        console.error('Error uploading file:', data);
        return null;
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      return null;
    }
  };
  
  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      
      if (result.type === 'success') {
        const { uri, name, mimeType } = result;
        
        if (uri && name && mimeType) {
          const fileUrl = await uploadFile({ uri, name, type: mimeType });
          if (fileUrl) {
            handleChange('certificateUrl', fileUrl);
            console.log('File uploaded successfully:', fileUrl);
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
