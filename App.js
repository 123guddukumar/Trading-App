import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth } from './firebase/firebaseConfig';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import StoreScreen from './screens/StoreScreen';
import ChatsScreen from './screens/ChatsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import PremiumCoursesScreen from './screens/PremiumCoursesScreen';
import WebViewScreen from './screens/WebViewScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import FreeCoursesScreen from './screens/FreeCoursesScreen'; 
import YourCertificateScreen from './screens/YourCertificateScreen';
import TradingViewScreen from './screens/TradingViewScreen';
import NewsViewScreen from './screens/NewsViewScreen';
import AnalysisViewScreen from './screens/AnalysisViewScreen';
import YoutubeViewScreen from './screens/YoutubeViewScreen';
import HowToUseScreen from './screens/HowToUseScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import ConsultationScreen from './screens/ConsultationScreen';

// Main Stack Navigator
const Stack = createStackNavigator();

// Main Tab Navigator
const Tab = createBottomTabNavigator();

function MainTabs({ user }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Store') iconName = 'store';
          else if (route.name === 'Chats') iconName = 'chat';
          else if (route.name === 'Profile') iconName = 'person';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 5,
          elevation: 5,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        options={{ headerShown: false }}
      >
        {(props) => <HomeScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen
        name="Store"
        options={{ headerShown: false }}
      >
        {(props) => <StoreScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Chats"
        options={{ headerShown: false }}
      >
        {(props) => <ChatsScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{ headerShown: false }}
      >
        {(props) => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              options={{ headerShown: false }}
            >
              {(props) => <MainTabs {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: 'Edit Profile' }}
            />
            <Stack.Screen
              name="PremiumCourses"
              component={PremiumCoursesScreen}
              options={{ title: 'My Premium Courses' }}
            />
            <Stack.Screen
              name="WebViewScreen"
              component={WebViewScreen}
              options={{ title: 'WhatsApp Group' }}
            />
            <Stack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
              options={{ title: 'Course Details' }}
            />
            <Stack.Screen
              name="FreeCourses"
              component={FreeCoursesScreen}
              options={{ title: 'Free Courses' }}
            />
            <Stack.Screen
              name="YourCertificate"
              component={YourCertificateScreen}
              options={{ title: 'Your Certificates & Videos' }}
            />
            <Stack.Screen
             name="TradingView" 
             component={TradingViewScreen} 
             options={{ title: 'Live Chart' }}
            />
            <Stack.Screen
              name="NewsView"
              component={NewsViewScreen}
              options={{ title: 'News' }}
            />
            <Stack.Screen
              name="AnalysisView"
              component={AnalysisViewScreen}
              options={{ title: 'Live Analysis' }}
            />
            <Stack.Screen
              name="YoutubeView"
              component={YoutubeViewScreen}
              options={{ title: 'Live Q&A' }}
            />
            <Stack.Screen
              name="HowToUse"
              component={HowToUseScreen}
              options={{ title: 'How To Use App' }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{ title: 'Privacy Policy' }}
            />
            <Stack.Screen
              name="Consultation"
              component={ConsultationScreen}
              options={{ title: 'Meeting Consultation' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
    paddingBottom: 5,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});