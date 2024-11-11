import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useRouter } from 'expo-router';
import ProfessionalLayout from './ProfessionalLayout';

const ProfessionalRouteLayout = () => {
  const router = useRouter();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push('/login'); 
    }
  }, [user, router]);

  return <ProfessionalLayout />;
};

export default ProfessionalRouteLayout;