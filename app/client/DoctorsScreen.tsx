import { StyleSheet, Text, View, ScrollView, Button, Alert, ToastAndroid } from 'react-native'
import React, { useState, useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

const DoctorsScreen = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImagesToBackend = async (assets) => {
    const formData = new FormData();
    formData.append('userId', 'user-id-placeholder'); // Replace with actual user ID

    for (const asset of assets) {
      let imageUri = asset.uri;

      if (imageUri.startsWith('data:image')) {
        const base64Data = imageUri.split(',')[1];
        const path = `${FileSystem.cacheDirectory}myImage-${Date.now()}.jpg`;
        await FileSystem.writeAsStringAsync(path, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        imageUri = path;
      }

      const image = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `myImage-${Date.now()}.jpg`,
      };
      formData.append('files', image);
    }

    try {
      const response = await fetch('https://medplus-health.onrender.com/api/upload-prescription', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const pickAndUploadImage = async (source) => {
    let result;
    if (source === 'camera') {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true,
      });
    }

    if (!result.canceled && result.assets) {
      setIsUploading(true);
      try {
        await uploadImagesToBackend(result.assets);
        ToastAndroid.show('Images uploaded successfully!', ToastAndroid.SHORT);
      } catch (error) {
        console.error('Error uploading images:', error);
        Alert.alert('Error', 'An error occurred while uploading images');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUploadPrescription = () => pickAndUploadImage('gallery');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prescriptions</Text>
        <Button title="Upload Prescription" onPress={handleUploadPrescription} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnosis</Text>
        {/* Empty for now */}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lab Reports</Text>
        {/* Empty for now */}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Consultations/Appointments</Text>
        {/* Empty for now */}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feeds</Text>
        {/* Empty for now */}
      </View>
    </ScrollView>
  )
}

export default DoctorsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    marginBottom: 5,
  },
})