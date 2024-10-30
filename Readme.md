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

  In the context of the doctorsSlice in your Redux setup, caching helps improve performance by reducing unnecessary network requests and speeding up data access. Here’s how caching specifically benefits the doctorsSlice and how it works:

Overview of the doctorsSlice Caching Workflow
Initial Fetch and Storage:

When the doctorsSlice first mounts or is accessed, it triggers the fetchDoctors action. This action checks if the list of doctors is already available in the cache (i.e., in the Redux store or in persistent storage like AsyncStorage).
If the doctor data is not present (e.g., the user is opening the app for the first time), it makes an API call to fetch the doctor data.
The fetched doctor data is then stored in:
Redux State: This enables quick, in-memory access to the data within the current app session.
Persistent Storage (via redux-persist and AsyncStorage): This enables the data to persist between app sessions, meaning that even if the user closes and reopens the app, the data remains available without requiring a new network request.
Subsequent Requests and Cache Check:

When the user navigates back to the component that depends on the doctorsSlice, the app checks if doctor data is already available in the Redux store.
If the data is present, it bypasses the network request and uses the cached data in Redux (which is much faster than an API call).
If the data is not present (e.g., it was cleared from memory or it’s a new session), Redux retrieves it from the persisted storage (AsyncStorage) and loads it into memory, making it available instantly to the app.
Filtering and Sorting in Cached Data:

The filterDoctors selector function in doctorsSlice filters and sorts the cached doctor data based on the searchQuery and selectedCategory values. Since this function works on the cached data in Redux, it doesn’t trigger new API requests.
This local filtering makes interactions feel responsive and avoids hitting the API repeatedly for small changes.
Updating or Invalidating Cache:

If doctor data changes on the server (e.g., new doctors are added or existing ones are updated), the app needs to refresh the cache. This can be done with an action that clears and refetches the data, like refreshDoctors, or by invalidating the cache when certain conditions are met (e.g., after a specific time interval).
After invalidation, the next time fetchDoctors is called, it will detect the absence of cached data, make a fresh API call, and update both Redux and persistent storage with the new data.




import * as React from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/configureStore';
import { fetchDoctors, selectDoctors, filterDoctors } from '../store/doctorSlice';
import { fetchClinics, selectClinics, filterClinics } from '../store/clinicSlice';
import AllDoctorCardItem from '../../components/common/AllDoctorCardItem';
import ClinicCardItem from '../../components/common/ClinicCardItem';

const FullScreenSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const dispatch = useDispatch();
  
  const doctors = useSelector((state: RootState) => selectDoctors(state));
  const clinics = useSelector((state: RootState) => selectClinics(state));
  const loading = useSelector((state: RootState) => state.doctors.loading || state.clinics.loading);

  // Fetch doctors and clinics on mount
  React.useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchClinics());
  }, [dispatch]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    dispatch(filterDoctors({ searchQuery: query, selectedCategory: '' }));
    dispatch(filterClinics({ searchQuery }));
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search Doctors or Clinics"
        onChangeText={handleSearch}
        value={searchQuery}
        autoFocus
        style={styles.searchBar}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#6200ea" />
      ) : (
        <FlatList
          data={[...filteredDoctors, ...filteredClinics]} // Combine results
          keyExtractor={(item) => item._id || item.id} // Ensure unique key
          renderItem={({ item }) => (
            item._id ? (
              <ClinicCardItem clinic={item} />
            ) : (
              <AllDoctorCardItem
                profileImage={item.profileImage}
                firstName={item.firstName}
                lastName={item.lastName}
                profession={item.profession}
              />
            )
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text>No results found</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  searchBar: {
    margin: 10,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});

export default FullScreenSearch;
