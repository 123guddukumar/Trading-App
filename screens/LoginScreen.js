import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        console.log('Login attempt with email:', email, 'and password:', password);

        try {
            if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
                console.log('Validation failed: Invalid email');
                Alert.alert('Error', 'Please enter a valid email');
                return;
            }
            if (!password) {
                console.log('Validation failed: Password is required');
                Alert.alert('Error', 'Password is required');
                return;
            }

            console.log('Attempting to sign in...');
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
            console.log('Login successful for user:', userCredential.user.email);
            // Navigation to Main is handled by AppNavigator
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = error.message;
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No user found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            }
            Alert.alert('Login Failed', errorMessage);
        }
    };

    const handleForgotPassword = async () => {
        console.log('Forgot password attempt with email:', email);

        if (!email.trim()) {
            console.log('Validation failed: Email is required for password reset');
            Alert.alert('Error', 'Please enter your email to reset your password.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email.trim());
            console.log('Password reset email sent to:', email);
            Alert.alert('Success', 'Password reset email sent! Check your inbox.');
        } catch (error) {
            console.error('Forgot password error:', error);
            let errorMessage = error.message;
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No user found with this email.';
            }
            Alert.alert('Error', errorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    link: {
        color: '#007BFF',
        textAlign: 'center',
        marginTop: 15,
    },
});