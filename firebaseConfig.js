import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDdF3I-cFVrAMknLCcZI4NiH_RVNe9ovjU",
    authDomain: "trading-afe83.firebaseapp.com",
    projectId: "trading-afe83",
    storageBucket: "trading-afe83.firebasestorage.app",
    databaseURL: "https://trading-afe83-default-rtdb.firebaseio.com/",
    messagingSenderId: "369147263189",
    appId: "1:369147263189:web:16b5651e95fb4ed6d44a5c",
    measurementId: "G-2VE6JRFBRE",
};

// Initialize Firebase
let clientApp;
try {
    const apps = getApps();
    if (!apps.find(app => app.name === 'client')) {
        clientApp = initializeApp(firebaseConfig, 'client');
    } else {
        clientApp = getApp('client');
    }
} catch (error) {
    console.error('Error initializing Firebase app:', error);
    throw error;
}

// Initialize Auth with persistence
let auth;
try {
    auth = initializeAuth(clientApp, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
} catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    throw error;
}

// Initialize Database
let database;
try {
    database = getDatabase(clientApp);
} catch (error) {
    console.error('Error initializing Firebase Database:', error);
    throw error;
}

export { database, auth };


