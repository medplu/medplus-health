import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const ClinicsSkeleton: React.FC = () => {
  const shimmerAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <Animated.View style={[styles.skeletonImage, shimmerStyle]} />
          <Animated.View style={[styles.skeletonText, shimmerStyle]} />
          <Animated.View style={[styles.skeletonText, shimmerStyle]} />
          <Animated.View style={[styles.skeletonText, shimmerStyle]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  skeletonItem: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    width: 200,
  },
  skeletonImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  skeletonText: {
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 5,
    width: '90%',
  },
});

export default ClinicsSkeleton;
