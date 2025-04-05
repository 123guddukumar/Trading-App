import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const socialMediaData = [
    {
        id: '1',
        name: 'YouTube',
        icon: 'youtube',
        color: '#FF0000',
        url: 'https://www.youtube.com',
    },
    {
        id: '2',
        name: 'WhatsApp',
        icon: 'whatsapp',
        color: '#25D366',
        url: 'https://www.whatsapp.com',
    },
    {
        id: '3',
        name: 'Instagram',
        icon: 'instagram',
        color: '#E1306C',
        url: 'https://www.instagram.com',
    },
    {
        id: '4',
        name: 'Facebook',
        icon: 'facebook',
        color: '#3B5998',
        url: 'https://www.facebook.com',
    },
    {
        id: '5',
        name: 'Twitter',
        icon: 'twitter',
        color: '#1DA1F2',
        url: 'https://www.twitter.com',
    },
    {
        id: '6',
        name: 'LinkedIn',
        icon: 'linkedin',
        color: '#0077B5',
        url: 'https://www.linkedin.com',
    },
    {
        id: '7',
        name: 'Telegram',
        icon: 'telegram',
        color: '#0088CC',
        url: 'https://www.telegram.org',
    },
];

export default function SocialMediaLinks() {
    const handlePress = async (url, name) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', `Cannot open ${name} URL: ${url}`);
            }
        } catch (error) {
            Alert.alert('Error', `Failed to open ${name}: ${error.message}`);
        }
    };

    const renderSocialMedia = ({ item }) => (
        <TouchableOpacity
            style={[styles.iconContainer, { backgroundColor: item.color }]}
            onPress={() => handlePress(item.url, item.name)}
        >
            <Icon name={item.icon} size={24} color="#fff" />
            <Text style={styles.label}></Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connect With Us</Text>
            <FlatList
                data={socialMediaData}
                renderItem={renderSocialMedia}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.icons}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    icons: {
        paddingHorizontal: 5,
    },
    iconContainer: {
        width: 60,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        paddingTop:20,
    },
    label: {
        fontSize: 12,
        color: '#fff',
        textAlign: 'center',
        marginTop: 5,
    },
});