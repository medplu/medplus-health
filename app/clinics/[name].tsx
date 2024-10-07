import { View, Text, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import SharedHeader from '../../components/Shared/SharedHeader';
import ClinicDoctorTab from '../../components/clinicdoctorsscreen/ClinicDoctorTab';
import ClinicListBig from '../../components/clinicdoctorsscreen/ClinicListBig';
import DoctorList from '../../components/clinicdoctorsscreen/DoctorList'; // Import DoctorList component
import GlobalApi from '../../Services/GlobalApi';
import Colors from '../../components/Shared/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

interface Clinic {
  id: string;
  name: string;
  // Add other clinic properties here
}

interface Doctor {
  id: string;
  name: string;
  // Add other doctor properties here
}

interface RouteParams {
  name: string;
}

export default function ClinicDoctorsList() {
  const [clinicDoctorsList, setClinicDoctorsList] = useState<Clinic[]>([]);
  const [doctorList, setDoctorList] = useState<Doctor[]>([]); // State for doctors
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Clinics');
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { name: categoryName } = route.params;

  useEffect(() => {
    if (activeTab === 'Clinics') {
      getClinicsByCategory();
    } else {
      getDoctorsByCategory();
    }
  }, [activeTab]);

  const getClinicsByCategory = async () => {
    setIsLoading(true);
    try {
      const resp = await GlobalApi.getClinicsByCategory(categoryName);
      setClinicDoctorsList(resp.data);
      await AsyncStorage.setItem('clinicDoctorsList', JSON.stringify(resp.data)); // Store data in AsyncStorage
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDoctorsByCategory = async () => {
    setIsLoading(true);
    try {
      const resp = await GlobalApi.getDoctorsByCategory(categoryName);
      setDoctorList(resp.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <SharedHeader title={categoryName} />
      <ClinicDoctorTab activeTab={(value: string) => setActiveTab(value)} />
      {isLoading ? (
        <ActivityIndicator size={'large'} color={Colors.PRIMARY} style={{ marginTop: '50%'}} />
      ) : (
        <>
          {activeTab === 'Clinics' ? (
            <ClinicListBig clinicDoctorsList={clinicDoctorsList} />
          ) : (
            <DoctorList doctorList={doctorList} />
          )}
        </>
      )}
    </View>
  );
}