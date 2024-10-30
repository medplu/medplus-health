// hooks/useDoctors.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store/configureStore';
import { fetchDoctors } from '../app/store/doctorSlice';

const useDoctors = () => {
  const dispatch = useDispatch<AppDispatch>();
  const doctorList = useSelector((state: RootState) => state.doctors.doctorList);
  const loading = useSelector((state: RootState) => state.doctors.loading);
  const error = useSelector((state: RootState) => state.doctors.error);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  return { doctorList, loading, error };
};

export default useDoctors;
