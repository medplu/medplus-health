export const uploadImageToCloudinary = async (imageUri) => {
  const data = new FormData();
  const response = await fetch(imageUri);
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
    return result.secure_url;
  } catch (uploadError) {
    console.error('Error uploading image to Cloudinary:', uploadError);
    throw uploadError;
  }
};




