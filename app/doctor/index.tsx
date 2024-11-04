import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, FlatList, TextInput, Button } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesome, Ionicons } from '@expo/vector-icons'; // Add Ionicons to imports
import DoctorCard from '../../components/common/DoctorCardItem';
import HorizontalLine from '../../components/common/HorizontalLine';
import Colors from '../../components/Shared/Colors';
import BookingSection from '../../components/BookingSection';
import Doctors from '../../components/dashboard/Doctors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AirbnbRating } from 'react-native-ratings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DoctorCardItem from '../../components/common/DoctorCardItem';
import { useSelector } from 'react-redux'; // Import useSelector

type RouteParams = {
  doctor: string; // JSON string
};

type Doctor = {
  _id: string;
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
  const doctor: Doctor = JSON.parse(route.params.doctor); // Deserialize the doctor object

  // Retrieve userId from Redux store
  const userId = useSelector((state: any) => state.user.id); // Adjust according to your Redux state structure

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

  return (
    <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="black" /> {/* Use Ionicons arrow */}
    </TouchableOpacity>
      <FlatList
        contentContainerStyle={styles.scrollViewContent}
        data={[doctor]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <>
            <DoctorCardItem doctor={item} />
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                {showFullBio ? item.bio : `${item.bio?.substring(0, 100) || ''}...`}
              </Text>
              <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
                <Text style={styles.readMoreText}>{showFullBio ? 'Read Less' : 'Read More'}</Text>
              </TouchableOpacity>
            </View>
            <BookingSection
              doctorId={item._id}
              userId={userId} // Use userId from Redux here
              consultationFee={item.consultationFee}
            />
            <HorizontalLine />
            <Text style={styles.sectionTitle}>View More Professionals</Text>
            <Doctors
              searchQuery=""
              selectedCategory=""
              onViewAll={handleViewAll}
              excludeDoctorId={doctor._id} // Add this line
            />
            <HorizontalLine />
            <Text style={styles.sectionTitle}>Reviews</Text>
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
            <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
              <Text style={styles.viewMoreText}>
                {showAllReviews ? 'View Less Reviews' : 'View More Reviews'}
              </Text>
            </TouchableOpacity>
            <View style={styles.addReviewContainer}>
              <Text style={styles.addReviewTitle}>Add Your Review</Text>
              <AirbnbRating
                count={5}
                defaultRating={newRating}
                size={30}
                onFinishRating={(rating) => setNewRating(rating)}
                starContainerStyle={{ paddingVertical: 5 }}
              />
              <TextInput
                style={styles.reviewInput}
                placeholder="Write your review here..."
                value={newReview}
                onChangeText={setNewReview}
              />
              <Button title="Submit" onPress={handleAddReview} />
            </View>
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
    paddingTop: 60, // Adjust padding to accommodate back button
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
});

export default DoctorProfile;

