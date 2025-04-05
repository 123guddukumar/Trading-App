import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { auth, database } from '../firebase/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function EditProfileScreen({ route, navigation }) {
    const { userData } = route.params;
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        about: '',
        rollNumber: '',
        photoURL: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [photoUri, setPhotoUri] = useState(userData.photoURL || '');
    const currentUserRef = useRef(auth.currentUser);

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                mobile: userData.mobile || '',
                about: userData.about || '',
                rollNumber: userData.rollNumber || '',
                photoURL: userData.photoURL || '',
            });
            setPhotoUri(userData.photoURL || '');
        }
    }, [userData]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            currentUserRef.current = currentUser;
        });
        return unsubscribe;
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = useCallback(async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        let attempt = 0;
        const maxAttempts = 3;

        while (attempt < maxAttempts) {
            try {
                const user = currentUserRef.current;
                if (!user) {
                    throw new Error('No authenticated user found. Please log in again.');
                }

                await user.reload();
                console.log(`Attempt ${attempt + 1}, User reloaded, UID:`, user.uid);

                await new Promise((resolve) => setTimeout(resolve, 500));

                await updateProfile(user, {
                    displayName: formData.name.trim(),
                    photoURL: photoUri || user.photoURL,
                });

                const userRef = ref(database, `users/${user.uid}`);
                await set(userRef, {
                    name: formData.name.trim(),
                    mobile: formData.mobile || '',
                    about: formData.about || '',
                    rollNumber: formData.rollNumber || '',
                    photoURL: photoUri || '',
                    email: user.email,
                    dateOfJoining: userData.dateOfJoining,
                });

                navigation.navigate('Profile', {
                    updatedData: {
                        name: formData.name,
                        mobile: formData.mobile,
                        about: formData.about,
                        rollNumber: formData.rollNumber,
                    },
                    photoURL: photoUri,
                });

                Alert.alert('Success', 'Profile updated successfully');
                navigation.goBack();
                break;
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                attempt++;
                if (attempt === maxAttempts || error.message.includes('not authenticated')) {
                    Alert.alert('Error', `Error saving profile: ${error.message}`);
                    if (error.message.includes('not authenticated')) {
                        Alert.alert('Session Expired', 'Please log in again.');
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
            }
        }

        if (attempt === maxAttempts) {
            Alert.alert('Error', 'Failed to save profile after multiple attempts.');
        }

        setIsLoading(false);
    }, [formData, photoUri, navigation]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
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
                setPhotoUri(imageUri);
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Edit Profile</Text>

                <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                    <Image
                        source={
                            photoUri
                                ? { uri: photoUri }
                                : require('../assets/default-user.png')
                        }
                        style={styles.profileImage}
                    />
                    <View style={styles.addImageIcon}>
                        <Icon name="add-a-photo" size={24} color="#fff" />
                    </View>
                </TouchableOpacity>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Name*</Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        value={formData.name}
                        onChangeText={(text) => handleChange('name', text)}
                        placeholder="Enter your name"
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Mobile Number</Text>
                    <TextInput
                        style={[styles.input, errors.mobile && styles.inputError]}
                        value={formData.mobile}
                        onChangeText={(text) => handleChange('mobile', text)}
                        placeholder="Enter mobile number"
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                    {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.email}
                        editable={false}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>About</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={formData.about}
                        onChangeText={(text) => handleChange('about', text)}
                        placeholder="Tell us about yourself"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Roll Number</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.rollNumber}
                        onChangeText={(text) => handleChange('rollNumber', text)}
                        placeholder="Enter roll number"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date of Joining</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.dateOfJoining}
                        editable={false}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
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
    addImageIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#007BFF',
        borderRadius: 15,
        padding: 5,
        borderWidth: 2,
        borderColor: '#fff',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    inputError: {
        borderColor: '#ff4444',
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#ff4444',
        marginTop: 5,
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});