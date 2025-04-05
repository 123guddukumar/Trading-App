import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
    Animated,
    Modal,
    Dimensions,
    Platform
} from 'react-native';
import { database, auth } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const YourCertificateScreen = ({ navigation, route }) => {
    const [userCertificates, setUserCertificates] = useState([]);
    const [user, setUser] = useState(route.params?.user || null);
    const [downloadProgress, setDownloadProgress] = useState(new Animated.Value(0));
    const [downloading, setDownloading] = useState(false);
    const [currentDownloadUrl, setCurrentDownloadUrl] = useState(null);
    const [downloadedPdfUri, setDownloadedPdfUri] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((authenticatedUser) => {
            if (authenticatedUser && !user) {
                setUser(authenticatedUser);
            }
        });

        if (!user?.uid) {
            Alert.alert('Error', 'User not authenticated. Please log in again.');
            navigation.navigate('Login');
            return;
        }

        const certificatesRef = ref(database, `userCertificates/${user.uid}`);
        const unsubscribe = onValue(certificatesRef, (snapshot) => {
            const data = snapshot.val();
            const certificates = data ? Object.values(data) : [];
            setUserCertificates(certificates);
        }, (error) => {
            console.error('Error fetching certificates:', error);
            Alert.alert('Error', 'Failed to load certificates');
        });

        return () => {
            unsubscribe();
            unsubscribeAuth();
        };
    }, [user?.uid, navigation]);

    const requestStoragePermission = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Please allow storage access to download files.');
            return false;
        }
        return true;
    };

    const downloadFile = async (url, fileType, fileName) => {
        try {
            setDownloading(true);
            setCurrentDownloadUrl(url);
            setDownloadProgress(new Animated.Value(0));
            setDownloadedPdfUri(null);

            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            const downloadResumable = FileSystem.createDownloadResumable(
                url,
                fileUri,
                {},
                (downloadProgressData) => {
                    const progress = downloadProgressData.totalBytesWritten / downloadProgressData.totalBytesExpectedToWrite;
                    Animated.timing(downloadProgress, {
                        toValue: progress,
                        duration: 200,
                        useNativeDriver: false,
                    }).start();
                }
            );

            const { uri } = await downloadResumable.downloadAsync();
            console.log('File downloaded to:', uri);

            if (fileType === 'Video') {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                    await MediaLibrary.createAssetAsync(uri);
                    Alert.alert('Success', `${fileType} downloaded and saved to your gallery!`);
                } else {
                    Alert.alert('Permission Denied', 'Cannot save video to gallery. File is in your downloads.');
                }
            } else if (fileType === 'Certificate') {
                const pdfUri = `file://${uri}`;
                setDownloadedPdfUri(pdfUri);
                Alert.alert('Success', 'Certificate downloaded successfully!', [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                    { text: 'View PDF', onPress: () => setDownloadedPdfUri(pdfUri) },
                ]);
            }

            setDownloading(false);
            setCurrentDownloadUrl(null);
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', `Failed to download ${fileType}: ${error.message}`);
            setDownloading(false);
            setCurrentDownloadUrl(null);
            setDownloadedPdfUri(null);
        }
    };

    const renderCertificateItem = ({ item }) => {
        const isCertificate = item.certificateUrl;
        const isVideo = item.videoUrl && item.thumbnailUrl;
        const fileUrl = isCertificate ? item.certificateUrl : item.videoUrl;
        const fileType = isCertificate ? 'Certificate' : 'Video';
        const fileName = isCertificate ? `certificate_${item.id}.pdf` : `video_${item.id}.mp4`;

        return (
            <View style={styles.cardContainer}>
                <LinearGradient
                    colors={['#f8f9fa', '#e9ecef']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.cardHeader}>
                        <Icon
                            name={isCertificate ? 'picture-as-pdf' : 'videocam'}
                            size={24}
                            color="#495057"
                            style={styles.cardIcon}
                        />
                        <Text style={styles.cardTitle}>{item.title || (isCertificate ? 'Certificate' : 'Video')}</Text>
                    </View>

                    <Image
                        source={{ uri: isCertificate ? item.certificateUrl : item.thumbnailUrl }}
                        style={styles.cardThumbnail}
                        resizeMode="cover"
                    />

                    <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => downloadFile(fileUrl, fileType, fileName)}
                        disabled={downloading && currentDownloadUrl === fileUrl}
                    >
                        <LinearGradient
                            colors={['#4e54c8', '#8f94fb']}
                            style={styles.downloadButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Icon name="cloud-download" size={20} color="#fff" />
                            <Text style={styles.downloadButtonText}>Download {fileType}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {downloading && currentDownloadUrl === fileUrl && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressTextContainer}>
                                <Text style={styles.progressText}>Downloading...</Text>
                                <Text style={styles.progressPercentage}>
                                    {Math.round(downloadProgress.__getValue() * 100)}%
                                </Text>
                            </View>
                            <Animated.View
                                style={[
                                    styles.progressBar,
                                    {
                                        width: downloadProgress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%'],
                                        }),
                                    },
                                ]}
                            />
                        </View>
                    )}
                </LinearGradient>
            </View>
        );
    };

    return (
        <LinearGradient
            colors={['#f5f7fa', '#c3cfe2']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Your Achievements</Text>
                <Text style={styles.subHeader}>Certificates & Training Videos</Text>
            </View>

            <FlatList
                data={userCertificates}
                renderItem={renderCertificateItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="folder-open" size={50} color="#adb5bd" />
                        <Text style={styles.emptyText}>No certificates or videos available</Text>
                        <Text style={styles.emptySubText}>Your completed content will appear here</Text>
                    </View>
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={!!downloadedPdfUri}
                onRequestClose={() => setDownloadedPdfUri(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Document Viewer</Text>
                            <TouchableOpacity
                                style={styles.closeModalButton}
                                onPress={() => setDownloadedPdfUri(null)}
                            >
                                <Icon name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <WebView
                            source={{ uri: downloadedPdfUri }}
                            style={styles.pdf}
                        />
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    headerContainer: {
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2b2d42',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    subHeader: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listContent: {
        paddingBottom: 24,
    },
    cardContainer: {
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    cardGradient: {
        borderRadius: 16,
        padding: 20,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardIcon: {
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2b2d42',
        flex: 1,
    },
    cardThumbnail: {
        width: '100%',
        height: width * 0.5,
        borderRadius: 12,
        marginBottom: 16,
    },
    downloadButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    downloadButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    progressContainer: {
        marginTop: 16,
    },
    progressTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressText: {
        fontSize: 14,
        color: '#6c757d',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2b2d42',
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        backgroundColor: '#e9ecef',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4e54c8',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#495057',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: '#adb5bd',
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 20,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2b2d42',
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    closeModalButton: {
        padding: 4,
    },
    pdf: {
        flex: 1,
    },
});

export default YourCertificateScreen;