import React from 'react';
import { View, ScrollView, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or any other icon library

const HowToUseScreen = () => {
    const features = [
        {
            title: "Market Analysis",
            description: "Access real-time charts and market data using our integrated TradingView platform.",
            icon: "stats-chart"
        },
        {
            title: "Video Tutorials",
            description: "Watch instructional videos to understand market trends and how to use app features.",
            icon: "videocam"
        },
        {
            title: "Live Streaming",
            description: "Join live sessions from our YouTube channel directly within the app.",
            icon: "tv"
        },
        {
            title: "Portfolio Tracking",
            description: "Monitor your investments with our intuitive portfolio management tools.",
            icon: "wallet"
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>How to Use Our App</Text>
                <Text style={styles.headerSubtitle}>Get started with these simple steps</Text>
            </View>

            <View style={styles.heroContainer}>
                <Image
                    source={require('../assets/video-tutorials.png')} // Replace with your image
                    style={styles.heroImage}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.stepsContainer}>
                <Text style={styles.sectionTitle}>Key Features</Text>

                {features.map((feature, index) => (
                    <View key={index} style={styles.featureCard}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={feature.icon} size={24} color="#4a6cff" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.featureTitle}>{feature.title}</Text>
                            <Text style={styles.featureDescription}>{feature.description}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.tipsContainer}>
                <Text style={styles.sectionTitle}>Pro Tips</Text>
                <View style={styles.tipItem}>
                    <Ionicons name="md-bulb" size={20} color="#FFD700" />
                    <Text style={styles.tipText}>Pinch to zoom on charts for detailed analysis</Text>
                </View>
                <View style={styles.tipItem}>
                    <Ionicons name="md-bulb" size={20} color="#FFD700" />
                    <Text style={styles.tipText}>Swipe left/right to switch between timeframes</Text>
                </View>
                <View style={styles.tipItem}>
                    <Ionicons name="md-bulb" size={20} color="#FFD700" />
                    <Text style={styles.tipText}>Enable notifications for price alerts</Text>
                </View>
            </View>

            <View style={styles.contactContainer}>
                <Text style={styles.contactText}>Need more help? Contact support@yourapp.com</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
    },
    header: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    heroContainer: {
        height: 200,
        marginVertical: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    stepsContainer: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
    },
    iconContainer: {
        marginRight: 16,
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    tipsContainer: {
        marginTop: 24,
        marginBottom: 32,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
    },
    tipText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 12,
        flex: 1,
    },
    contactContainer: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
        marginBottom: 20,
    },
    contactText: {
        fontSize: 14,
        color: '#4a6cff',
        fontWeight: '500',
    },
});

export default HowToUseScreen;