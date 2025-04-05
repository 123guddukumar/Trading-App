import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { database } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';

export default function StoreScreen({ navigation }) {
    const [topCourses, setTopCourses] = useState([]);

    // Fetch top courses from Firebase (you might want to sort by rating or popularity)
    useEffect(() => {
        const coursesRef = ref(database, 'courses');

        onValue(
            coursesRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Filter premium courses and sort them by some criteria (like rating)
                    const premiumCourses = Object.values(data).filter((course) => course.type === 'premium');
                    // Sort courses by rating (highest first) - adjust this based on your data structure
                    const sortedTopCourses = premiumCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    // Take only the top 5 or however many you want to display
                    setTopCourses(sortedTopCourses.slice(0, 5));
                } else {
                    setTopCourses([]);
                }
            },
            (error) => {
                console.error('Error fetching courses:', error);
            }
        );
    }, []);

    const handleCoursePress = (course) => {
        console.log('Course pressed:', course.title);
        navigation.navigate('CourseDetail', { course });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Courses ({topCourses.length})</Text>
                {topCourses.length > 0 ? (
                    topCourses.map((course) => (
                        <TouchableOpacity
                            key={course.id}
                            style={styles.courseCard}
                            onPress={() => handleCoursePress(course)}
                        >
                            <View style={styles.courseInfo}>
                                <Text style={styles.courseTitle}>{course.title}</Text>
                                <Text style={styles.courseSubtitle}>{course.subtitle}</Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.price}>₹{course.discountPrice}</Text>
                                    <Text style={styles.originalPrice}>₹{course.price}</Text>
                                    <Text style={styles.discount}>{course.discountPercent}% OFF</Text>
                                </View>
                                {/* Add rating display if available */}
                                {course.rating && (
                                    <View style={styles.ratingContainer}>
                                        <Text style={styles.ratingText}>Rating: {course.rating}/5</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.courseImagePlaceholder}>
                                <Image
                                    source={{ uri: course.thumbnail }}
                                    style={styles.courseImage}
                                    resizeMode="cover"
                                />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noCoursesText}>No top courses available.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        marginTop: 110,
    },
    section: {
        paddingVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    courseCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    courseInfo: {
        flex: 1,
        marginRight: 10,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    courseSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    originalPrice: {
        fontSize: 14,
        textDecorationLine: 'line-through',
        color: '#999',
        marginRight: 10,
    },
    discount: {
        fontSize: 14,
        color: 'green',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        color: '#FFA500', // Orange color for rating
    },
    courseImagePlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    courseImage: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    noCoursesText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});