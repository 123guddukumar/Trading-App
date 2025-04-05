import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function PromoBanner({ onPress }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>You are almost there!</Text>
            <Text style={styles.subtitle}>Buy your course now & start your preparation</Text>
            <View style={styles.card}>
                <Image
                    source={require('../assets/course_image.png')} // Replace with your image
                    style={styles.courseImage}
                />
                <View style={styles.courseDetails}>
                    <Text style={styles.courseTag}>MULTIPLE VALIDITY</Text>
                    <Text style={styles.courseTag}>VIDEOS</Text>
                    <Text style={styles.courseTag}>FILES</Text>
                    <Text style={styles.courseTitle}>BASIC TO ADVANCED CANDLESTICK COURSE ...</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹5,400/-</Text>
                        <Text style={styles.originalPrice}>₹59,999/-</Text>
                        <Text style={styles.discount}>91% OFF</Text>
                    </View>
                </View>
                <View style={styles.couponContainer}>
                    <Text style={styles.couponText}>CANDLE_STICK_COURSE_COUPONS</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.buyButton} onPress={onPress}>
                <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4B0082', // Purple background
        padding: 20,
        margin: 15,
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    courseImage: {
        width: 100,
        height: 100,
        borderRadius: 5,
    },
    courseDetails: {
        flex: 1,
        marginLeft: 10,
    },
    courseTag: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
    },
    courseTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 5,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 10,
    },
    discount: {
        fontSize: 12,
        color: '#FF4500',
    },
    couponContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#FF4500',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 3,
    },
    couponText: {
        fontSize: 10,
        color: '#fff',
    },
    buyButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        borderRadius: 25,
        alignItems: 'center',
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});