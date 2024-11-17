import { manipulateAsync } from 'expo-image-manipulator';

export const uploadImageToCloudinary = async (imageUri) => {
  const resizeImage = async (uri) => {
    const result = await manipulateAsync(uri, [{ resize: { width: 800 } }]);
    return result.uri;
  };

  const resizedUri = await resizeImage(imageUri);
  const data = new FormData();
  const response = await fetch(resizedUri);
  const blob = await response.blob();

  data.append('file', blob);
  data.append('upload_preset', 'medplus');
  data.append('quality', 'auto');
  data.append('fetch_format', 'auto');

  try {
    const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dws2bgxg4/image/upload', {
      method: 'POST',
      body: data,
    });
    const result = await uploadResponse.json();
    console.log('Cloudinary Upload Response:', result); // Debug log to check Cloudinary response
    return result.secure_url; // Return secure_url instead of url
  } catch (uploadError) {
    console.error('Error uploading image to Cloudinary:', uploadError);
    throw uploadError;
  }
};




