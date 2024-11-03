import * as React from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/configureStore';
import { fetchDoctors, selectDoctors, filterDoctors } from '../store/doctorSlice';
import { fetchClinics, selectClinics, filterClinics } from '../store/clinicSlice';
import { useNavigation } from '@react-navigation/native';
import Colors from '@/components/Shared/Colors';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView

const FullScreenSearch: React.FC = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const doctors = useSelector((state: RootState) => selectDoctors(state));
    const clinics = useSelector((state: RootState) => selectClinics(state));
    const loading = useSelector((state: RootState) => state.doctors.loading || state.clinics.loading);

    React.useEffect(() => {
        dispatch(fetchDoctors());
        dispatch(fetchClinics());
    }, [dispatch]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        dispatch(filterDoctors({ searchQuery: query, selectedCategory: '' }));
        dispatch(filterClinics({ searchQuery }));
    };

    const handleConsult = (doctor: Doctor) => {
        navigation.navigate('doctor/index', { doctor: JSON.stringify(doctor) });
    };

    const handlePress = async (item) => {
        router.push({
            pathname: `/hospital/book-appointment/${item._id}`,
            params: { clinicId: item._id },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Searchbar
                placeholder="Search Doctors or Clinics"
                onChangeText={handleSearch}
                value={searchQuery}
                autoFocus
                style={styles.searchBar}
                inputStyle={styles.input} // Add custom input styles
            />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6200ea" />
                </View>
            ) : (
                <FlatList
                    data={[...doctors, ...clinics]}
                    keyExtractor={(item) => item._id || item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            {item.profession ? (
                                <>
                                    <Image source={{ uri: item.profileImage }} style={styles.image} />
                                    <View style={styles.info}>
                                        <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
                                        <Text style={styles.profession}>{item.profession}</Text>
                                        <Text style={styles.profession}>{item.email}</Text>
                                        <TouchableOpacity onPress={() => handleConsult(item)}>
                                            <Text style={styles.bookButton}>Book</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <>
                                    {item.image && (
                                        <Image source={{ uri: item.image }} style={styles.image} />
                                    )}
                                    <View style={styles.info}>
                                        <Text style={styles.clinicName}>{item.name}</Text>
                                        <Text style={styles.clinicLocation}>{item.location}</Text>
                                        <TouchableOpacity
                                            style={[styles.button, styles.scheduleButton]}
                                            onPress={() => handlePress(item)}
                                        >
                                            <Text style={styles.buttonText}>Schedule Visit</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No results found</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.flatListContent} // Add padding to the FlatList content
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    searchBar: {
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 8,
        elevation: 3,
        height: 50, // Set a fixed height for the search bar
    },
    input: {
        height: 40, // Adjust input height
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    profession: {
        color: 'gray',
        marginTop: 4,
    },
    clinicName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    clinicLocation: {
        color: 'gray',
        marginTop: 4,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    scheduleButton: {
        backgroundColor: Colors.PRIMARY,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
    flatListContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    bookButton: {
        color: Colors.GREEN,
        fontWeight: 'bold',
        marginTop: 8,
    },
});

export default FullScreenSearch;
