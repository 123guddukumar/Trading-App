import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function VideoCard({ title, duration, image, onPress }) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.thumbnailContainer}>
                <Image source={image} style={styles.thumbnail} />
                <View style={styles.playIconContainer}>
                    <Icon name="play-circle-outline" size={30} color="#fff" />
                </View>
                {duration ? (
                    <Text style={styles.duration}>{duration}</Text>
                ) : null}
            </View>
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 5,
    },
    thumbnailContainer: {
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
    },
    thumbnail: {
        width: 150,
        height: 100,
        borderRadius: 10,
    },
    playIconContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: -15 }],
    },
    duration: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 10,
    },
    title: {
        fontSize: 12,
        color: '#333',
        marginTop: 5,
        width: 150,
    },
});