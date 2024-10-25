const fetchSchedule = async (doctorId: string) => {
    console.log('doctorId before fetch:', doctorId); // Log the doctorId before the fetch request
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${doctorId}`);
      console.log('Fetch response:', response); // Log the entire response object
  
      if (response.status === 200 && response.data.slots) {
        setSchedule(response.data.slots);
        console.log('Fetched schedule:', response.data.slots);
      } else {
        console.error('Failed to fetch schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error.message); // Log the error message
    }
  };