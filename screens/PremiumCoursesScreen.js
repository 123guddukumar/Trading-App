import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { database, auth } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';

export default function PremiumCoursesScreen() {
    const [purchases, setPurchases] = useState([]);
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            const purchasesRef = ref(database, `purchases/${user.uid}`);
            onValue(purchasesRef, (snapshot) => {
                const data = snapshot.val();
                setPurchases(data ? Object.values(data) : []);
            });
        }
    }, []);

    const joinWhatsAppGroup = async () => {
        const url = 'https://chat.whatsapp.com/your-group-link'; // Replace with your WhatsApp group link
        try {
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert('Error', 'Failed to open WhatsApp group link');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Premium Courses</Text>
            {user && (
                <>
                    <Text style={styles.info}>Username: {user.displayName || 'User'}</Text>
                    <Text style={styles.info}>Email: {user.email}</Text>
                </>
            )}
            <Text style={styles.subtitle}>Purchased Courses:</Text>
            {purchases.length > 0 ? (
                purchases.map((purchase, index) => (
                    <View key={index} style={styles.courseItem}>
                        <Text style={styles.courseTitle}>{purchase.courseTitle}</Text>
                        <Text style={styles.coursePrice}>Price: ₹{purchase.price}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.noCourses}>No courses purchased yet.</Text>
            )}
            <TouchableOpacity style={styles.whatsappButton} onPress={joinWhatsAppGroup}>
                <Text style={styles.whatsappButtonText}>Join WhatsApp Group</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    info: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    courseItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    coursePrice: {
        fontSize: 14,
        color: '#666',
    },
    noCourses: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    whatsappButton: {
        backgroundColor: '#25D366',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    whatsappButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});