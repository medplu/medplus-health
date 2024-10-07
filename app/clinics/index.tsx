import { View, Text, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import SharedHeader from '../../components/Shared/SharedHeader';
import ClinicDoctorTab from '../../components/clinicdoctorsscreen/ClinicDoctorTab';
import ClinicListBig from '../../components/clinicdoctorsscreen/ClinicListBig';
import DoctorList from '../../components/clinicdoctorsscreen/DoctorList'; // Import DoctorList component
import GlobalApi from '../../Services/GlobalApi';
import Colors from '../../components/Shared/Colors';

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
  categoryName?: string;
}

export default function ClinicDoctorsList() {
  const [clinicDoctorsList, setClinicDoctorsList] = useState<Clinic[]>([]);
  const [doctorList, setDoctorList] = useState<Doctor[]>([]); // State for doctors
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Clinics');
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const param = route.params || {};

  useEffect(() => {
    if (activeTab === 'Clinics') {
      getClinicsByCategory();
    } else {
      getDoctorsByCategory();
    }
  }, [activeTab]);

  const getClinicsByCategory = () => {
    setIsLoading(true);
    GlobalApi.getClinicsByCategory(param?.categoryName || '')
      .then(resp => {
        setClinicDoctorsList(resp.data.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getDoctorsByCategory = () => {
    setIsLoading(true);
    GlobalApi.getDoctorsByCategory(param?.categoryName || '')
      .then(resp => {
        setDoctorList(resp.data.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <View style={{ padding: 20 }}>
      <SharedHeader title={param?.categoryName} />
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