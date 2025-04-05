import React from 'react';
import { ScrollView, Text, StyleSheet, Linking, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = () => {
    const openEmail = () => {
        Linking.openURL('mailto:privacy@yourapp.com');
    };

    const openWebsite = () => {
        Linking.openURL('https://yourapp.com/privacy');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>

            <Section title="1. Information We Collect">
                <Text style={styles.text}>
                    We collect information to provide better services to all our users. This includes:
                </Text>
                <BulletPoint text="Account information (name, email, profile picture)" />
                <BulletPoint text="Device information (model, operating system)" />
                <BulletPoint text="Usage data (features used, time spent)" />
            </Section>

            <Section title="2. How We Use Information">
                <Text style={styles.text}>
                    We use the information we collect to:
                </Text>
                <BulletPoint text="Provide, maintain, and improve our services" />
                <BulletPoint text="Develop new features and functionality" />
                <BulletPoint text="Provide personalized content" />
                <BulletPoint text="Ensure security and prevent fraud" />
            </Section>

            <Section title="3. Information Sharing">
                <Text style={styles.text}>
                    We do not share your personal information with companies, organizations, or individuals except in the following cases:
                </Text>
                <BulletPoint text="With your consent" />
                <BulletPoint text="For external processing with our trusted partners" />
                <BulletPoint text="For legal reasons or to prevent harm" />
            </Section>

            <Section title="4. Data Security">
                <Text style={styles.text}>
                    We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your data.
                </Text>
            </Section>

            <Section title="5. Your Rights">
                <Text style={styles.text}>
                    You have the right to:
                </Text>
                <BulletPoint text="Access, update, or delete your information" />
                <BulletPoint text="Object to our processing of your data" />
                <BulletPoint text="Request restriction of processing" />
                <BulletPoint text="Request data portability" />
            </Section>

            <Section title="6. Changes to This Policy">
                <Text style={styles.text}>
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </Text>
            </Section>

            <View style={styles.contactContainer}>
                <Text style={styles.contactTitle}>Contact Us</Text>
                <Text style={styles.contactText}>
                    If you have any questions about this Privacy Policy, please contact us:
                </Text>
                <View style={styles.contactRow}>
                    <Ionicons name="mail" size={16} color="#4a6cff" />
                    <Text style={[styles.contactText, styles.link]} onPress={openEmail}>
                        privacy@yourapp.com
                    </Text>
                </View>
                <View style={styles.contactRow}>
                    <Ionicons name="globe" size={16} color="#4a6cff" />
                    <Text style={[styles.contactText, styles.link]} onPress={openWebsite}>
                        yourapp.com/privacy
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const Section = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const BulletPoint = ({ text }) => (
    <View style={styles.bulletPoint}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    lastUpdated: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        marginBottom: 10,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 5,
        marginLeft: 5,
    },
    bullet: {
        marginRight: 8,
        color: '#444',
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
    },
    contactContainer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    contactText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        marginBottom: 10,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    link: {
        color: '#4a6cff',
        marginLeft: 8,
        textDecorationLine: 'underline',
    },
});

export default PrivacyPolicyScreen;