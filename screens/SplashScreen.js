import React, { useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { globalStyles } from '../styles/globalStyles';

export default function SplashScreen({ navigation }) {
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 2000, easing: Easing.ease });
        setTimeout(() => navigation.replace('Login'), 3000);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={globalStyles.container}>
            <Animated.View style={[globalStyles.logoContainer, animatedStyle]}>
                <Image source={require('../assets/logo.png')} style={globalStyles.logo} />
                <Text style={globalStyles.appName}>BTech Trader App</Text>
            </Animated.View>
        </View>
    );
}