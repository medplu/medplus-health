// src/components/PulsatingCalendarIcon.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface PulsatingCalendarIconProps {
    onPress: () => void;
}

const PulsatingCalendarIcon: React.FC<PulsatingCalendarIconProps> = ({ onPress }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = () => {
            pulseAnim.setValue(1);
            Animated.timing(pulseAnim, {
                toValue: 1.1,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start(pulse);
            });
        };
        pulse();
    }, [pulseAnim]);

    return (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Icon name="calendar" size={24} color="#333" onPress={onPress} />
        </Animated.View>
    );
};

export default PulsatingCalendarIcon;
