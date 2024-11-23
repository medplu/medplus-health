import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, Button, Dimensions } from 'react-native';
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
import { useSelector } from 'react-redux';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from 'react-native-elements';

type RouteParams = {
  doctor: string;
};

type Doctor = {
  _id: string;
  name: string;
  specialties: string[];
  profileImage: string;
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
  console.log('Doctor:', doctor);

  const userId = useSelector((state: any) => state.user.id);

  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(0);
  const [showFullBio, setShowFullBio] = useState<boolean>(false);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);

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

  const profileImageUri = doctor.profileImage
    ? doctor.profileImage
    : 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg';

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.profileContainer}>
          <Avatar
            rounded
            size="large"
            source={{ uri: profileImageUri }}
            containerStyle={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.categoryName}>{doctor.specialties.join(', ')}</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MaterialIcons name="work" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{doctor.yearsOfExperience} Years</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="people" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{doctor.numberOfPatients} Patients</Text>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome name="star" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{reviews.length} Reviews</Text>
          </View>
        </View>
        <BookingSection doctorId={doctor._id} consultationFee={doctor.consultationFee} />
        <HorizontalLine />
        <Text style={styles.sectionTitle}>View More Professionals</Text>
        <Doctors searchQuery="" selectedCategory="" onViewAll={handleViewAll} excludeDoctorId={doctor._id} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light_gray,
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
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.light_gray,
    borderRadius: 8,
    marginBottom: 20,
  },
  avatar: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  categoryName: {
    fontSize: 16,
    color: Colors.gray,
    marginVertical: 4,
  },
});

export default DoctorProfile;

