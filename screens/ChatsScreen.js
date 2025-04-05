import React from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { useFonts } from 'expo-font';

const ComingSoonScreen = () => {
    // Animation values
    const pulseAnim = new Animated.Value(1);
    const slideAnim = new Animated.Value(0);

    // Load custom fonts (optional)
    const [fontsLoaded] = useFonts({
        'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
        'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    });

    // Start animations
    React.useEffect(() => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Slide-in animation
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.back(1)),
            useNativeDriver: true,
        }).start();
    }, []);

    const slideUp = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
    });

    if (!fontsLoaded) {
        return null; // or a loading spinner
    }

    return (
        <View style={styles.container}>
            {/* Background with subtle gradient */}
            <View style={styles.background} />

            {/* Content */}
            <View style={styles.content}>
                {/* Logo or app icon */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        { transform: [{ scale: pulseAnim }] }
                    ]}
                >
                    <Image
                        source={require('../assets/logo.png')} // Replace with your logo
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Main heading */}
                <Animated.Text
                    style={[
                        styles.heading,
                        { transform: [{ translateY: slideUp }], opacity: slideAnim }
                    ]}
                >
                    Coming Soon
                </Animated.Text>

                <Animated.Text
                    style={[
                        styles.subheading,
                        { transform: [{ translateY: slideUp }], opacity: slideAnim }
                    ]}
                >
                    We're working hard to bring you something amazing!
                </Animated.Text>

                {/* Countdown or progress indicator */}
                <Animated.View
                    style={[
                        styles.progressContainer,
                        { transform: [{ translateY: slideUp }], opacity: slideAnim }
                    ]}
                >
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: pulseAnim.interpolate({
                                        inputRange: [1, 1.05],
                                        outputRange: ['70%', '75%'],
                                    })
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>Development in progress: 70%</Text>
                </Animated.View>

                
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        // backgroundColor: '#4a6fa5',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    logoContainer: {
        marginBottom: 30,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 20,
        backgroundColor: 'white', // fallback if no logo
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    heading: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
    },
    subheading: {
        fontSize: 18,
        color: '#7f8c8d',
        marginBottom: 40,
        textAlign: 'center',
        fontFamily: 'Montserrat-Regular',
        lineHeight: 28,
    },
    progressContainer: {
        width: '100%',
        marginBottom: 40,
    },
    progressBar: {
        height: 10,
        backgroundColor: '#ecf0f1',
        borderRadius: 5,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4a6fa5',
        borderRadius: 5,
    },
    progressText: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
        fontFamily: 'Montserrat-Regular',
    },
    contactContainer: {
        alignItems: 'center',
    },
    contactText: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 15,
        fontFamily: 'Montserrat-Regular',
    },
    socialLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialLink: {
        marginHorizontal: 15,
        fontSize: 16,
        color: '#4a6fa5',
        fontFamily: 'Montserrat-Regular',
        textDecorationLine: 'underline',
    },
});

export default ComingSoonScreen;