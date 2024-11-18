import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useRouter } from 'expo-router';
import PharmacyLayout from './PharmacyLayout';

const ProfessionalRouteLayout = () => {
  const router = useRouter();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push('/login'); 
    }
  }, [user, router]);

  return <PharmacyLayout />;
};

export default ProfessionalRouteLayout;