import { useState } from 'react';
import { Button, Image, View, StyleSheet, ActivityIndicator } from 'react-native';
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
      const response = await fetch(`http://localhost:3000/api/images/upload`, {
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setUploading(true);
      const cloudinaryUrl = await uploadImageToCloudinary(result.assets[0].uri);
      setImage(cloudinaryUrl);
      await sendImageUrlToBackend(cloudinaryUrl);
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} disabled={uploading} />
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
      {image && <Image source={{ uri: image }} style={styles.image} />}
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
});
