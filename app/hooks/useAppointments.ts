import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, selectAppointments, selectLoading, selectError } from '../store/appointmentsSlice';
import { RootState, AppDispatch } from '../store/configureStore';

const useAppointments = () => {
    const dispatch = useDispatch<AppDispatch>();
    const appointments = useSelector(selectAppointments);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        dispatch(fetchAppointments());
    }, [dispatch]);

    return { appointments, loading, error };
};

export default useAppointments;

import { fetchAppointments, selectAppointments, selectLoading, selectError } from '../store/appointmentsSlice';
import { RootState, AppDispatch } from '../store/configureStore';

    const error = useSelector(selectError);

    useEffect(() => {
        dispatch(fetchAppointments());
    }, [dispatch]);

    return { appointments, loading, error };
};

export default useAppointments;

    const dispatch = useDispatch<AppDispatch>();
    const appointments = useSelector(selectAppointments);
    const loading = useSelector(selectLoading);
const useAppointments = () => {