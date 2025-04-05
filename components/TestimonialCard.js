import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const testimonials = [
    {
        id: '1',
        quote: "Learning is important I studying from you, don't leave live stream and one thing I proud I'm a #MMCFAMILY member I'm seeing live from AUGmid",
        studentName: 'D PRATHAP',
        image: require('../assets/student_image.png'), // Replace with your image
    },
    {
        id: '2',
        quote: "The courses are amazing! I've learned so much about trading and candlestick patterns. Highly recommend!",
        studentName: 'R SHARMA',
        image: require('../assets/student_image.png'),
    },
    {
        id: '3',
        quote: "The live classes are a game-changer. I feel more confident in my trading decisions now.",
        studentName: 'A SINGH',
        image: require('../assets/student_image.png'),
    },
];

export default function TestimonialCard({ onAdd }) {
    const [index, setIndex] = useState(0);

    const handlePrev = () => {
        if (index > 0) {
            setIndex(index - 1);
        } else {
            Alert.alert('No more testimonials', 'You are at the first testimonial.');
        }
    };

    const handleNext = () => {
        if (index < testimonials.length - 1) {
            setIndex(index + 1);
        } else {
            Alert.alert('No more testimonials', 'You are at the last testimonial.');
        }
    };

    const renderTestimonial = ({ item }) => (
        <View style={styles.testimonial}>
            <Text style={styles.quoteIcon}>“</Text>
            <Text style={styles.quote}>{item.quote}</Text>
            <View style={styles.studentInfo}>
                <Image source={item.image} style={styles.studentImage} />
                <View>
                    <Text style={styles.studentName}>{item.studentName}</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Learn More', `Learn more about ${item.studentName}'s experience`)}>
                        <Text style={styles.learnMore}>Learn more</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>What our students have to say</Text>
                <TouchableOpacity onPress={onAdd}>
                    <Text style={styles.addButton}>+ Add</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={testimonials}
                renderItem={renderTestimonial}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                onMomentumScrollEnd={(event) => {
                    const newIndex = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                    setIndex(newIndex);
                }}
            />
            <View style={styles.navigation}>
                <TouchableOpacity onPress={handlePrev}>
                    <Icon name="arrow-back" size={24} color={index === 0 ? '#ccc' : '#333'} />
                </TouchableOpacity>
                <View style={styles.dots}>
                    {testimonials.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, { backgroundColor: i === index ? '#333' : '#ccc' }]}
                        />
                    ))}
                </View>
                <TouchableOpacity onPress={handleNext}>
                    <Icon name="arrow-forward" size={24} color={index === testimonials.length - 1 ? '#ccc' : '#333'} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        fontSize: 14,
        color: '#007BFF',
    },
    testimonial: {
        width: 300, // Fixed width for horizontal scrolling
        paddingHorizontal: 10,
    },
    quoteIcon: {
        fontSize: 40,
        color: '#FF69B4',
        marginBottom: 5,
    },
    quote: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 15,
        fontStyle: 'italic',
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    studentImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    studentName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    learnMore: {
        fontSize: 12,
        color: '#007BFF',
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    dots: {
        flexDirection: 'row',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
});