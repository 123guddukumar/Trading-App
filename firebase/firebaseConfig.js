import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDdF3I-cFVrAMknLCcZI4NiH_RVNe9ovjU",
    authDomain: "trading-afe83.firebaseapp.com",
    projectId: "trading-afe83",
    storageBucket: "trading-afe83.firebasestorage.app",
    messagingSenderId: "369147263189",
    appId: "1:369147263189:web:16b5651e95fb4ed6d44a5c",
    measurementId: "G-2VE6JRFBRE",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export { app, auth };