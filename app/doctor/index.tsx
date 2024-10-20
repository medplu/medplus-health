import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, FlatList, TextInput, Button } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import DoctorCard from '../../components/common/DoctorCardItem';
import HorizontalLine from '../../components/common/HorizontalLine';
import Colors from '../../components/Shared/Colors';
import BookingSection from '../../components/BookingSection';
import DoctorServices from '../../components/DoctorServices';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AirbnbRating } from 'react-native-ratings';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RouteParams = {
  doctor: Doctor;
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
  const { doctor } = route.params;
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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.scrollViewContent}
        data={[doctor]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <DoctorCard doctor={item} userId={item.user} consultationFee={item.consultationFee} />
            <HorizontalLine />
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                {showFullBio ? item.bio : `${item.bio?.substring(0, 100) || ''}...`}
              </Text>
              <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
                <Text style={styles.readMoreText}>{showFullBio ? 'Read Less' : 'Read More'}</Text>
              </TouchableOpacity>
            </View>
            <BookingSection doctorId={item._id} />
            <DoctorServices />
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
              <Text style={styles.viewMoreText}>{showAllReviews ? 'View Less Reviews' : 'View More Reviews'}</Text>
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
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
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
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  reviewList: {
    marginVertical: 10,
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reviewUser: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewComment: {
    marginTop: 5,
    color: '#555',
  },
  viewMoreText: {
    color: Colors.primary,
    marginTop: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addReviewContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  addReviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
});

export default DoctorProfile;