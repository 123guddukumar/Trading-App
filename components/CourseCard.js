import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CourseCard({ title, price, originalPrice, discount, image, onPress }) {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={image} style={styles.courseImage} />
                <View style={styles.imageOverlay}>
                    <Text style={styles.overlayText}>MMC</Text>
                    <Text style={styles.overlaySubText}>LIVE CLASSES - PHASE - 1</Text>
                </View>
            </View>
            <View style={styles.tags}>
                <Text style={styles.tag}>LIVE CLASS</Text>
                <Text style={styles.tag}>FILES</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.discountContainer}>
                <Icon name="local-offer" size={16} color="#FF4500" />
                <Text style={styles.discountText}>Extra 25% coupon discount</Text>
            </View>
            <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{price}/-</Text>
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                <Text style={styles.discount}>{discount}% OFF</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={styles.buttonText}>Get this course</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        padding: 15, // Increased padding for better spacing
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: 240, // Slightly increased width for better proportion
        height: 430, // Increased height for the card
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 15, // Increased margin for better spacing
    },
    courseImage: {
        width: 210, // Adjusted width to fit the new container
        height: 200, // Increased height for a taller image
        borderRadius: 5,
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 5,
        borderTopLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    overlayText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    overlaySubText: {
        fontSize: 10,
        color: '#fff',
    },
    tags: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10, // Increased margin for better spacing
    },
    tag: {
        fontSize: 10,
        color: '#666',
        marginHorizontal: 5,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10, // Increased margin for better spacing
    },
    discountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10, // Increased margin for better spacing
    },
    discountText: {
        fontSize: 12,
        color: '#FF4500',
        marginLeft: 5,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18, // Increased margin for better spacing
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
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 15, // Slightly increased padding for a taller button
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});