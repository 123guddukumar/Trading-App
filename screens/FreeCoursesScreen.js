import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
    Platform,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { database } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FreeCoursesScreen({ navigation }) {
    const [freeCourses, setFreeCourses] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        const coursesRef = ref(database, 'courses');
        const unsubscribe = onValue(coursesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const coursesArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                const freeCoursesList = coursesArray.filter(course => course.type === 'free');
                freeCoursesList.sort((a, b) => b.createdAt - a.createdAt);
                setFreeCourses(freeCoursesList);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleVideoPress = async (course) => {
        setSelectedVideo(course);
        setIsLoading(true);
        setError(null);
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };

    const closeVideoPlayer = async () => {
        setSelectedVideo(null);
        setIsLoading(false);
        setError(null);
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };

    const handleFullscreenChange = async (isFullscreen) => {
        if (isFullscreen) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        }
    };

    const renderCourseItem = ({ item }) => (
        <TouchableOpacity
            style={styles.courseCard}
            onPress={() => handleVideoPress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.thumbnailContainer}>
                <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <View style={styles.playButton}>
                    <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
                </View>
            </View>
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderVideoPlayer = () => {
        if (!selectedVideo) return null;

        return (
            <SafeAreaView style={styles.videoContainer}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeVideoPlayer}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={40} color="#ff3333" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => handleVideoPress(selectedVideo)}
                        >
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Video
                    ref={videoRef}
                    source={{ uri: selectedVideo.video }}
                    style={styles.videoPlayer}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                    onError={(error) => {
                        setError('Failed to load video. Please check your connection.');
                        setIsLoading(false);
                        console.error('Video error:', error);
                    }}
                    onLoadStart={() => setIsLoading(true)}
                    onLoad={() => setIsLoading(false)}
                    onFullscreenUpdate={async (event) => {
                        await handleFullscreenChange(event.fullscreenUpdate === 1);
                    }}
                />

                <View style={styles.videoInfoContainer}>
                    <Text style={styles.videoTitle}>{selectedVideo.title}</Text>
                </View>
            </SafeAreaView>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Free Courses</Text>
                <Text style={styles.subHeader}>Learn valuable skills for free</Text>
            </View>

            {freeCourses.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="videocam-off" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>No free courses available yet</Text>
                </View>
            ) : (
                <FlatList
                    data={freeCourses}
                    renderItem={renderCourseItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <Modal
                visible={!!selectedVideo}
                transparent={false}
                animationType="slide"
                onRequestClose={closeVideoPlayer}
            >
                {renderVideoPlayer()}
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
    },
    headerContainer: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2d3436',
    },
    subHeader: {
        fontSize: 16,
        color: '#636e72',
        marginTop: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    courseCard: {
        flex: 1,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    thumbnailContainer: {
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: 120,
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    courseInfo: {
        padding: 12,
    },
    courseTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 4,
        lineHeight: 20,
    },
    dateText: {
        fontSize: 12,
        color: '#636e72',
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    videoContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoPlayer: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.5625, // 16:9 aspect ratio
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 5,
    },
    loadingContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    errorContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 20,
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    retryButton: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#ff3333',
        borderRadius: 5,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    videoInfoContainer: {
        padding: 20,
    },
    videoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});