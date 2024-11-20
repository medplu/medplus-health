import { useState, useEffect } from 'react';
import { Button, Image, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { useRouter } from 'expo-router';

export default function ImagePickerExample({ pharmacyId }) {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  console.log('Pharmacy ID:', pharmacyId);

  const sendImageUrlToBackend = async (imageUrl: string) => {
    try {
      const response = await fetch(`https://medplus-health.onrender.com/api/images/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pharmacyId, imageUrl }),
      });
      const result = await response.json();
      console.log('Backend response:', result);
      if (result.message === "Image uploaded successfully") {
        router.push('/pharmacist/tabs');
      }
    } catch (error) {
      console.error('Error sending image URL to backend:', error);
    }
  };

  const handleUpload = async (source) => {
    setUploading(true);
    try {
      const cloudinaryUrl = await uploadImageToCloudinary(source.uri);
      setImage(cloudinaryUrl);
      await sendImageUrlToBackend(cloudinaryUrl);
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const type = result.assets[0].type || 'image'; // Default to 'image' if type is not available
      const name = uri.split('/').pop(); // Extract the file name from the URI
      const source = { uri, type, name };
      handleUpload(source);
    }
  };

  const retakeImage = () => {
    setImage(null);
  };

  const testNetworkRequest = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      const data = await response.json();
      console.log('Test network request response:', data);
    } catch (error) {
      console.error('Test network request error:', error);
    }
  };

  // Call testNetworkRequest to ensure network requests are working
  useEffect(() => {
    testNetworkRequest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Pharmacy Image</Text>
      <Text style={styles.description}>Please select an image to upload for the pharmacy.</Text>
      <Button title="Pick an image from camera roll" onPress={pickImage} disabled={uploading} />
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
      {image && (
        <>
          <Image source={{ uri: image }} style={styles.image} />
          <Button title="Retake Image" onPress={retakeImage} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
});
