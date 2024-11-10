import * as React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SearchBarSkeleton: React.FC = () => {
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
      <Animated.View style={[styles.skeletonBar, shimmerStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  skeletonBar: {
    width: '90%',    
    height: 50,      
    borderRadius: 25, 
    backgroundColor: '#e0e0e0', 
  },
});

export default SearchBarSkeleton;
