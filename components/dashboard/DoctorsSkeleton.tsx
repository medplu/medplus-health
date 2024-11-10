import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const DoctorsSkeleton: React.FC = () => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
  };

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[styles.skeletonImage, shimmerStyle]} />
      <View style={styles.skeletonNameContainer}>
        <Animated.View style={[styles.skeletonName, shimmerStyle]} />
        <Animated.View style={[styles.skeletonFee, shimmerStyle]} />
      </View>
      <Animated.View style={[styles.skeletonCategory, shimmerStyle]} />
      <Animated.View style={[styles.skeletonButton, shimmerStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    width: 240,
    alignItems: 'center',
  },
  skeletonImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  skeletonNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  skeletonName: {
    width: '50%',
    height: 16,
    borderRadius: 5,
    backgroundColor: '#d4d4d4',
  },
  skeletonFee: {
    width: '30%',
    height: 16,
    borderRadius: 5,
    backgroundColor: '#d4d4d4',
  },
  skeletonCategory: {
    width: '40%',
    height: 14,
    borderRadius: 5,
    backgroundColor: '#d4d4d4',
    marginVertical: 8,
  },
  skeletonButton: {
    width: '60%',
    height: 35,
    borderRadius: 20,
    backgroundColor: '#d4d4d4',
    marginTop: 10,
  },
});

export default DoctorsSkeleton;
