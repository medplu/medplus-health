import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, FlatList, TextInput, Button, Dimensions } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import DoctorCard from '../../components/common/DoctorCardItem';
import HorizontalLine from '../../components/common/HorizontalLine';
import Colors from '../../components/Shared/Colors';
import BookingSection from '../../components/BookingSection';
import Doctors from '../../components/dashboard/Doctors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AirbnbRating } from 'react-native-ratings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DoctorCardItem from '../../components/common/DoctorCardItem';
import { useSelector } from 'react-redux';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { MaterialIcons } from '@expo/vector-icons';

type RouteParams = {
  doctor: string;
};

type Doctor = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  image?: { url: string };
  user: string;
  consultationFee: number;
};

type Review = {
  id: string;
  user: string;
  rating: number;
  comment: string;
};

const DoctorProfile: React.FC = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const doctor: Doctor = JSON.parse(route.params.doctor);

  const userId = useSelector((state: any) => state.user.id);

  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(0);
  const [showFullBio, setShowFullBio] = useState<boolean>(false);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'schedule', title: 'Schedule' },
    { key: 'about', title: 'About' },
    { key: 'experience', title: 'Experience' },
    { key: 'reviews', title: 'Reviews' },
  ]);

  useEffect(() => {
    fetchReviews();
    setIsLoading(false);
  }, []);

  const fetchReviews = async () => {
    const dummyReviews = [
      { id: '1', user: 'John Doe', rating: 4, comment: 'Great doctor!' },
      { id: '2', user: 'Jane Smith', rating: 5, comment: 'Very professional and kind.' },
      { id: '3', user: 'Alice Johnson', rating: 3, comment: 'Good, but could be better.' },
    ];
    setReviews(dummyReviews);
  };

  const handleAddReview = () => {
    const newReviewData: Review = {
      id: Math.random().toString(),
      user: 'Current User',
      rating: newRating,
      comment: newReview,
    };
    setReviews([...reviews, newReviewData]);
    setNewReview('');
    setNewRating(0);
  };

  const handleViewAll = (category: string) => {
    console.log(`View all professionals in category: ${category}`);
  };

  const renderScene = SceneMap({
    schedule: () => (
      <BookingSection
        doctorId={doctor._id}
        userId={userId}
        consultationFee={doctor.consultationFee}
      />
    ),
    about: () => (
      <View style={styles.tabContent}>
        <Text style={styles.tabText}>{doctor.bio}</Text>
      </View>
    ),
    experience: () => (
      <View style={styles.tabContent}>
        <Text style={styles.tabText}>
          Specialities: {doctor.specialities ? doctor.specialities.join(', ') : 'N/A'}
        </Text>
      </View>
    ),
    reviews: () => (
      <FlatList
        data={showAllReviews ? reviews : reviews.slice(0, 2)}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewUser}>{item.user}</Text>
            <AirbnbRating
              isDisabled={true}
              count={5}
              defaultRating={item.rating}
              size={20}
              showRating={false}
              starContainerStyle={{ paddingVertical: 5 }}
            />
            <Text style={styles.reviewComment}>{item.comment}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.reviewList}
      />
    ),
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Doctor information is missing.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <FlatList
        contentContainerStyle={styles.scrollViewContent}
        data={[doctor]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <>
            <DoctorCardItem doctor={item} />
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <MaterialIcons name="work" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{item.yearsOfExperience} Years</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="people" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{item.numberOfPatients} Patients</Text>
              </View>
              <View style={styles.infoItem}>
                <FontAwesome name="star" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{reviews.length} Reviews</Text>
              </View>
            </View>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: Dimensions.get('window').width }}
              renderTabBar={(props) => (
                <TabBar
                  {...props}
                  indicatorStyle={{ backgroundColor: Colors.primary }}
                  style={{ backgroundColor: 'white' }}
                  labelStyle={{ color: 'black' }}
                />
              )}
            />
            <HorizontalLine />
            <Text style={styles.sectionTitle}>View More Professionals</Text>
            <Doctors
              searchQuery=""
              selectedCategory=""
              onViewAll={handleViewAll}
              excludeDoctorId={doctor._id}
            />
          </>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.ligh_gray,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
  },
  descriptionContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
  },
  readMoreText: {
    color: Colors.primary,
    marginTop: 5,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 15,
    color: '#333',
  },
  reviewList: {
    marginVertical: 10,
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewUser: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  reviewComment: {
    marginTop: 5,
    color: '#555',
    fontSize: 14,
  },
  viewMoreText: {
    color: Colors.primary,
    marginTop: 5,
    fontWeight: '600',
    textAlign: 'center',
  },
  addReviewContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  addReviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  reviewInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabContent: {
    padding: 20,
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
});

export default DoctorProfile;

