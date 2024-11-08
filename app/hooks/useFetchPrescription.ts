import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setPrescription, clearPrescription } from '@/redux/prescriptionSlice';
import { AppDispatch } from '../store/configureStore';

const useFetchPrescription = (appointmentId: string | undefined) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentId) {
      const fetchPrescription = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`https://medplus-health.onrender.com/api/appointment/${encodeURIComponent(appointmentId)}`);
          console.log('Fetched prescription:', response.data.prescriptions);
          if (response.data.prescriptions && response.data.prescriptions.length > 0) {
            dispatch(setPrescription(response.data.prescriptions[0])); // Use the first prescription
          } else {
            console.log('Fetched prescription: undefined');
          }
        } catch (err: any) {
          console.error('Failed to fetch prescription:', err.message || err);
          setError(err.message || 'Failed to fetch prescription');
          dispatch(clearPrescription());
        } finally {
          setLoading(false);
        }
      };

      fetchPrescription();
    } else {
      dispatch(clearPrescription());
    }
  }, [appointmentId, dispatch]);

  return { loading, error };
};

export default useFetchPrescription;
