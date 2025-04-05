// screens/TradingViewScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

const AnalysisViewScreen = () => {
    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: 'https://ticker.finology.in/' }}
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

export default AnalysisViewScreen;