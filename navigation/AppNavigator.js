import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import StoreScreen from '../screens/StoreScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PremiumCoursesScreen from '../screens/PremiumCoursesScreen';
import WebViewScreen from '../screens/WebViewScreen';

// Custom Tab Bar Component
function CustomTabBar({ state, setState }) {
    const tabs = [
        { name: 'Home', icon: 'home' },
        { name: 'Store', icon: 'store' },
        { name: 'Chats', icon: 'chat' },
        { name: 'Profile', icon: 'person' },
    ];

    return (
        <View style={styles.tabBar}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.name}
                    style={styles.tabItem}
                    onPress={() => setState(tab.name)}
                >
                    <Icon
                        name={tab.icon}
                        size={24}
                        color={state === tab.name ? '#000' : '#666'}
                    />
                    <Text style={{ color: state === tab.name ? '#000' : '#666' }}>
                        {tab.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// Main Tabs Component
function MainTabs({ navigation, user }) {
    const [currentTab, setCurrentTab] = useState('Home');

    const renderScreen = () => {
        switch (currentTab) {
            case 'Home':
                return <HomeScreen navigation={navigation} user={user} />;
            case 'Store':
                return <StoreScreen navigation={navigation} />;
            case 'Chats':
                return <ChatsScreen navigation={navigation} />;
            case 'Profile':
                return <ProfileScreen navigation={navigation} user={user} />;
            default:
                return <HomeScreen navigation={navigation} user={user} />;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {renderScreen()}
            <CustomTabBar state={currentTab} setState={setCurrentTab} />
        </View>
    );
}

// Main Stack Navigator
const Stack = createStackNavigator();

export default function AppNavigator({ user }) {
    return (
        <Stack.Navigator>
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
        </Stack.Navigator>
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