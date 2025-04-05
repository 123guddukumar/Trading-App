// screens/TradingViewScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

const YoutubeViewScreen = () => {
    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: 'https://www.youtube.com/btech' }}
                style={styles.webview}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
});

export default YoutubeViewScreen;