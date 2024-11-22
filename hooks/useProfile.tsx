import { useEffect } from 'react';
import axios from 'axios';

const useFetchProfileImage = (userId: string, setProfileImage: (url: string) => void) => {
  useEffect(() => {
    const fetchProfileImage = async () => {
      console.log('Fetching profile image for userId:', userId); // Log userId
      try {
        const response = await axios.get(`https://medplus-health.onrender.com/clinic-images/user/${userId}`);
        if (response.data.length > 0) {
          console.log('Fetched profile image URL:', response.data[0].url); // Log fetched image URL
          setProfileImage(response.data[0].url);
        } else {
          console.log('No profile image found for userId:', userId); // Log if no image found
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    if (userId) {
      fetchProfileImage(); // Ensure fetchProfileImage is called
    }
  }, [userId]);
};

export default useFetchProfileImage;
