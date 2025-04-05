import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    ScrollView,
    SafeAreaView,
    Image,
    Animated,
} from 'react-native';
import { auth, database } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen({ navigation, route }) {
    const [userData, setUserData] = useState({
        name: '',
        mobile: '',
        email: '',
        about: '',
        rollNumber: '',
        dateOfJoining: '',
        photoURL: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const setUserDataRef = useRef(setUserData);
    const currentUserRef = useRef(auth.currentUser);

    useEffect(() => {
        setUserDataRef.current = setUserData;
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            currentUserRef.current = currentUser;
            if (currentUser) {
                console.log('ProfileScreen: User authenticated:', currentUser.email);
                const { displayName, phoneNumber, email, metadata, photoURL } = currentUser;
                setUserData((prev) => ({
                    ...prev,
                    name: displayName || '',
                    mobile: phoneNumber || '',
                    email: email || '',
                    dateOfJoining: metadata.creationTime || '',
                    photoURL: photoURL || '',
                }));

                const userRef = ref(database, `users/${currentUser.uid}`);
                onValue(
                    userRef,
                    (snapshot) => {
                        const data = snapshot.val();
                        if (data) {
                            setUserData((prev) => ({
                                ...prev,
                                name: data.name || displayName || '',
                                mobile: data.mobile || phoneNumber || '',
                                email: data.email || email || '',
                                about: data.about || '',
                                rollNumber: data.rollNumber || '',
                                dateOfJoining: data.dateOfJoining || metadata.creationTime || '',
                                photoURL: data.photoURL || photoURL || '',
                            }));
                        }
                    },
                    (error) => {
                        console.error('Error fetching user data:', error);
                        Alert.alert('Error', 'Failed to load user data: ' + error.message);
                    }
                );

                const purchasesRef = ref(database, `purchases/${currentUser.uid}`);
                onValue(
                    purchasesRef,
                    (snapshot) => {
                        const data = snapshot.val();
                        setHasPurchased(data && Object.keys(data).length > 0);
                    },
                    (error) => {
                        console.error('Error fetching purchases:', error);
                    }
                );

                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            } else {
                console.log('ProfileScreen: No user authenticated, redirecting to Login');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        });

        return unsubscribe;
    }, [navigation, fadeAnim]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            const { updatedData, photoURL } = route.params || {};
            if (updatedData || photoURL) {
                setUserData((prev) => ({
                    ...prev,
                    ...updatedData,
                    photoURL: photoURL || prev.photoURL,
                }));
            }
        });
        return unsubscribe;
    }, [navigation, route]);

    const handleEditToggle = () => {
        console.log('Edit button pressed, isEditing:', isEditing);
        // if (isEditing) {
        //     setIsEditing(false);
        // } else {
        //     navigation.navigate('EditProfile', { userData });
        // }
    };

    const handleLogout = async () => {
        try {
            console.log('Logging out user...');
            await signOut(auth);
            console.log('Logout successful');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', error.message);
        }
    };

    const handlePremiumCourses = () => {
        navigation.navigate('PremiumCourses');
    };

    const handleJoinWhatsApp = () => {
        const whatsappLink = 'https://chat.whatsapp.com/your-group-link';
        navigation.navigate('WebViewScreen', { url: whatsappLink });
    };

    const pickImage = useCallback(async () => {
        console.log('Picking image...');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission denied for media library');
            Alert.alert(
                'Permission Denied',
                'Please allow camera roll permissions in app settings!',
                [
                    { text: 'Open Settings', onPress: () => ImagePicker.openSettings() },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
            return;
        }
        console.log('Permission granted, launching image library...');
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['image'], // Corrected to array syntax
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            console.log('Image picker result:', result);

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                setUserData((prev) => ({ ...prev, photoURL: imageUri }));
                try {
                    if (currentUserRef.current) {
                        await currentUserRef.current.reload();
                        console.log('User reloaded for image update, UID:', currentUserRef.current.uid);
                        await currentUserRef.current.updateProfile({ photoURL: imageUri });
                        const userRef = ref(database, `users/${currentUserRef.current.uid}`);
                        await set(userRef, { ...userData, photoURL: imageUri });
                        console.log('Image update successful');
                    } else {
                        throw new Error('No authenticated user found.');
                    }
                } catch (error) {
                    console.error('Error updating profile image:', error);
                    Alert.alert('Error', 'Failed to update profile image: ' + error.message);
                }
            } else {
                console.log('Image selection canceled');
            }
        } catch (error) {
            console.error('Error launching image picker:', error);
            Alert.alert('Error', 'Failed to open image picker: ' + error.message);
        }
    }, [userData]);

    const renderField = (label, field, icon, editable = true) => {
        return (
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Icon name={icon} size={24} color="#007BFF" style={styles.infoIcon} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>{label}</Text>
                        {isEditing && editable ? (
                            <TextInput
                                style={styles.input}
                                value={userData[field]}
                                onChangeText={(text) =>
                                    setUserData((prev) => ({ ...prev, [field]: text }))
                                }
                            />
                        ) : (
                            <Text style={styles.infoValue}>{userData[field] || 'Not provided'}</Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={[styles.header, { backgroundColor: '#4a6fa5' }]}>
                    <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
                        <Image
                            source={
                                userData.photoURL
                                    ? { uri: userData.photoURL }
                                    : require('../assets/default-user.png')
                            }
                            style={styles.profileImage}
                        />
                        <View style={styles.editIconContainer}>
                            <Icon name="camera-alt" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>BTech Trader</Text>
                    <Text style={styles.headerSubtitle}>{userData.name}</Text>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Profile Information</Text>
                        <TouchableOpacity onPress={handlePremiumCourses}>
                            <Text style={styles.performanceText}>Courses</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.basicInfoHeader}>
                        <Text style={styles.basicInfoTitle}>Basic Information</Text>
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <TouchableOpacity onPress={handleEditToggle} style={styles.editButton}>
                                {/* <Text style={styles.editText}>
                                    {isEditing ? 'Cancel' : 'Edit Profile'}
                                </Text> */}
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {renderField('Name', 'name', 'person')}
                    {renderField('Mobile Number', 'mobile', 'phone')}
                    {renderField('Email', 'email', 'email', false)}
                    {renderField('About', 'about', 'info')}
                    {renderField('Roll Number', 'rollNumber', 'school')}
                    {renderField('Date of Joining', 'dateOfJoining', 'calendar-today', false)}

                    {hasPurchased ? (
                        <TouchableOpacity
                            style={styles.whatsappButton}
                            onPress={handleJoinWhatsApp}
                        >
                            <Text style={styles.buttonText}>Join WhatsApp Group</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.emptySpace} />
                    )}
                </View>

                {!isEditing && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    header: {
        padding: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#007BFF',
        borderRadius: 15,
        padding: 5,
        borderWidth: 2,
        borderColor: '#fff',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginTop: 5,
        opacity: 0.9,
    },
    infoSection: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    performanceText: {
        fontSize: 16,
        color: '#007BFF',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    },
    basicInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    basicInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    editButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    editText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
    },
    input: {
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 5,
        color: '#333',
    },
    whatsappButton: {
        backgroundColor: '#25D366',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    emptySpace: {
        height: 20,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});