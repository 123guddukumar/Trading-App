import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    Dimensions,
    StyleSheet,
    Animated,
    Linking,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import BannerCard from '../components/BannerCard';
import CategoryButton from '../components/CategoryButton';
import PromoBanner from '../components/PromoBanner';
import VideoCard from '../components/VideoCard';
import CourseCard from '../components/CourseCard';
import TestimonialCard from '../components/TestimonialCard';
import SocialMediaLinks from '../components/SocialMediaLinks';
import { database, auth } from '../firebaseConfig'; // Updated to include auth
import { ref, onValue, set } from 'firebase/database';
import Video from 'react-native-video';

// Sample data for categories (Explore the Market)
const categories = [
    { id: '1', icon: require('../assets/videos_icon.png'), label: 'Videos' },
    { id: '2', icon: require('../assets/live_qa_icon.png'), label: 'Live' },
    { id: '3', icon: require('../assets/news_icon.png'), label: 'News' },
    { id: '4', icon: require('../assets/live_market_icon.png'), label: 'Live Market' },
    { id: '5', icon: require('../assets/videos_icon.png'), label: 'Tutorials' },
    { id: '6', icon: require('../assets/live_qa_icon.png'), label: 'Webinars' },
    { id: '7', icon: require('../assets/news_icon.png'), label: 'Analysis' },
];

// Sample data for "What are you looking for?"
const lookingFor = [
    { id: '1', title: 'Courses', icon: require('../assets/courses_icon.png') },
    { id: '2', title: 'MMC Phases', icon: require('../assets/courses_icon.png') },
    { id: '3', title: 'Merchandise', icon: require('../assets/merchandise_icon.png') },
    { id: '4', title: '1:1 Consultation', icon: require('../assets/consultation_icon.png') },
];

// Menu items for the slide-in menu
const menuItems = [
    { id: '1', title: 'Course Certificates', icon: 'school', new: true },
    // { id: '2', title: 'Offline Downloads', icon: 'cloud-download', new: true },
    { id: '3', title: 'Free Material', icon: 'folder', new: false },
    // { id: '4', title: 'Students Testimonial', icon: 'comment', new: true },
    // { id: '5', title: 'Edit Profile', icon: 'person', new: false },
    // { id: '6', title: 'Settings', icon: 'settings', new: false },
    { id: '7', title: 'How to use the App', icon: 'help', new: true },
    { id: '8', title: 'Privacy Policy', icon: 'lock', new: false },
];

// Main HomeScreen component
export default function HomeScreen({ navigation }) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [banners, setBanners] = useState([]);
    const [courses, setCourses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [playingVideo, setPlayingVideo] = useState(null);
    const [showPaymentWebView, setShowPaymentWebView] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [currentCourse, setCurrentCourse] = useState(null);
    const [user, setUser] = useState(null); // State to hold the authenticated user
    const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width * 0.75)).current;

    // Fetch banners, courses, notifications, and users from Firebase
    useEffect(() => {
        const bannersRef = ref(database, 'banners');
        const coursesRef = ref(database, 'courses');
        const notificationsRef = ref(database, 'notifications');
        const usersRef = ref(database, 'users');

        onValue(bannersRef, (snapshot) => {
            const data = snapshot.val();
            setBanners(data ? Object.values(data) : []);
        });

        onValue(coursesRef, (snapshot) => {
            const data = snapshot.val();
            setCourses(data ? Object.values(data) : []);
        });

        onValue(notificationsRef, (snapshot) => {
            const data = snapshot.val();
            setNotifications(data ? Object.values(data).reverse() : []); // Reverse to show latest first
        });

        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            setUsers(data ? Object.values(data) : []);
        });

        // Listen to auth state changes
        const unsubscribeAuth = auth.onAuthStateChanged((authenticatedUser) => {
            if (authenticatedUser) {
                setUser(authenticatedUser); // Update user state when authenticated
            } else {
                setUser(null); // Clear user state when logged out
            }
        });

        return () => {
            unsubscribeAuth(); // Cleanup auth listener
        };
    }, []);

    const toggleMenu = () => {
        if (menuVisible) {
            Animated.timing(slideAnim, {
                toValue: -Dimensions.get('window').width * 0.75,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setMenuVisible(false));
        } else {
            setMenuVisible(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    const handleMenuItemPress = (title) => {
        toggleMenu();
        if (title === 'Course Certificates') {
            if (user) {
                navigation.navigate('YourCertificate', { user });
            } else {
                Alert.alert('Error', 'User not authenticated. Please log in again.');
                navigation.navigate('Login'); // Redirect to login if not authenticated
            }
        } else if (title === 'Free Material') {
            navigation.navigate('FreeCourses');
        } else if (title === 'Edit Profile') {
            navigation.navigate('EditProfile');
        } else if (title === 'How to use the App') {
            navigation.navigate('HowToUse');
        } else if (title === 'Privacy Policy') {
            navigation.navigate('PrivacyPolicy');
        } else {
            Alert.alert('Menu Item Pressed', `You clicked on ${title}`);
        }
    };

    const handleShareOnFacebook = async () => {
        const url = 'https://www.facebook.com/sharer/sharer.php?u=https://yourwebsite.com';
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open Facebook sharing URL');
            }
        } catch (error) {
            Alert.alert('Error', `Failed to share on Facebook: ${error.message}`);
        }
    };

    const playVideo = (videoUrl) => {
        setPlayingVideo(videoUrl);
    };

    const handlePurchaseCourse = async (course) => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in to purchase a course.');
            navigation.navigate('Login');
            return;
        }

        try {
            setCurrentCourse(course);
            console.log('Fetching order from server...');
            const response = await fetch('https://trading-app-1-nag0.onrender.com/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: course.discountPrice,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            const orderId = data.orderId;
            console.log('Order ID received:', orderId);

            const razorpayKey = 'rzp_test_gp96uKYK1wp4hS';
            const paymentOptions = {
                key: razorpayKey,
                amount: course.discountPrice * 100,
                currency: 'INR',
                name: 'BTech Trader',
                description: `Purchase ${course.title}`,
                image: 'https://yourwebsite.com/logo.png',
                order_id: orderId,
                prefill: {
                    email: user.email,
                    contact: '919876543210',
                    name: user.displayName || 'User',
                },
                theme: {
                    color: '#000',
                },
            };

            const formBody = Object.keys(paymentOptions)
                .map((key) => {
                    if (typeof paymentOptions[key] === 'object') {
                        return Object.keys(paymentOptions[key])
                            .map((subKey) => `${key}[${subKey}]=${encodeURIComponent(paymentOptions[key][subKey])}`)
                            .join('&');
                    }
                    return `${key}=${encodeURIComponent(paymentOptions[key])}`;
                })
                .join('&');

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                </head>
                <body>
                  <script>
                    var options = ${JSON.stringify(paymentOptions)};
                    options.handler = function (response) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        status: 'success',
                        payment_id: response.razorpay_payment_id,
                        order_id: response.razorpay_order_id,
                        signature: response.razorpay_signature
                      }));
                    };
                    options.modal = {
                      ondismiss: function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          status: 'dismissed'
                        }));
                      }
                    };
                    var rzp = new Razorpay(options);
                    rzp.on('payment.failed', function (response) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        status: 'failed',
                        error: response.error
                      }));
                    });
                    rzp.open();
                  </script>
                </body>
                </html>
            `;

            console.log('Payment URL:', `data:text/html,${encodeURIComponent(htmlContent)}`);
            setPaymentUrl(`data:text/html,${encodeURIComponent(htmlContent)}`);
            setShowPaymentWebView(true);
        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert('Payment Failed', error.message || 'An error occurred during payment.');
        }
    };

    const handleWebViewNavigationStateChange = async (navState) => {
        console.log('WebView navigation state:', navState);
        if (navState.url.includes('data:text/html')) {
            return;
        }
    };

    const handleWebViewMessage = async (event) => {
        console.log('WebView message received:', event.nativeEvent.data);
        let message;
        try {
            message = JSON.parse(event.nativeEvent.data);
        } catch (error) {
            console.error('Failed to parse WebView message:', error);
            Alert.alert('Error', 'Failed to process payment response.');
            setShowPaymentWebView(false);
            return;
        }

        if (message.status === 'success') {
            const { payment_id, order_id } = message;
            console.log('Payment successful:', { payment_id, order_id });

            try {
                const purchaseRef = ref(database, `purchases/${user.uid}/${order_id}`);
                const token = Math.random().toString(36).substr(2, 9).toUpperCase();
                const courseTitle = currentCourse ? currentCourse.title : 'Unknown Course';
                const coursePrice = currentCourse ? currentCourse.discountPrice : 0;

                console.log('Saving purchase to Firebase:', { courseId: order_id, courseTitle, price: coursePrice, token });
                await set(purchaseRef, {
                    courseId: order_id,
                    courseTitle,
                    price: coursePrice,
                    token,
                    purchasedAt: Date.now(),
                });
                console.log('Purchase saved to Firebase successfully');

                console.log('Notifying server of purchase...');
                const notifyResponse = await fetch('https://trading-app-1-nag0.onrender.com/notify-purchase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.uid,
                        userEmail: user.email,
                        userName: user.displayName || 'User',
                        courseTitle,
                        coursePrice,
                        token,
                    }),
                });

                if (!notifyResponse.ok) {
                    const errorText = await notifyResponse.text();
                    console.error('Failed to notify server:', errorText);
                    Alert.alert('Warning', 'Payment successful, but failed to notify server. Emails may not be sent.');
                } else {
                    console.log('Server notified successfully:', await notifyResponse.json());
                }

                setShowPaymentWebView(false);
                console.log('Redirecting to PremiumCourses...');
                navigation.navigate('PremiumCourses');
            } catch (error) {
                console.error('Error in handleWebViewMessage (success):', error);
                Alert.alert('Error', 'Payment successful, but failed to save purchase or notify server.');
                setShowPaymentWebView(false);
            }
        } else if (message.status === 'failed') {
            console.log('Payment failed:', message.error);
            setShowPaymentWebView(false);
            Alert.alert('Payment Failed', message.error.description || 'An error occurred during payment.');
        } else if (message.status === 'dismissed') {
            console.log('Payment dismissed');
            setShowPaymentWebView(false);
            Alert.alert('Payment Cancelled', 'You cancelled the payment.');
        } else {
            console.log('Unknown WebView message status:', message.status);
            setShowPaymentWebView(false);
            Alert.alert('Error', 'Unknown payment status.');
        }
    };

    const sections = [
        { type: 'banners' },
        { type: 'explore' },
        { type: 'lookingFor' },
        { type: 'promoBanner' },
        { type: 'freeVideos' },
        { type: 'featuredCourses' },
        { type: 'testimonials' },
        { type: 'socialMedia' },
    ];

    const renderBanner = ({ item }) => (
        <BannerCard
            image={{ uri: item.image }}
            title={item.title}
            onPress={() => Alert.alert('Banner Pressed', `You clicked on ${item.title}`)}
        />
    );

    const renderCategory = ({ item }) => (
        <CategoryButton
            icon={item.icon}
            label={item.label}
            onPress={() => {
                if (item.label === 'Videos') {
                    navigation.navigate('FreeCourses');
                } else if (item.label === 'Live') {
                    // Linking.openURL('https://www.youtube.com/mrbeats');
                    navigation.navigate('YoutubeView');
                } else if (item.label === 'Live Market') {
                    navigation.navigate('TradingView');
                } else if (item.label === 'News') {
                    navigation.navigate('NewsView');
                } else if (item.label === 'Tutorials') {
                    navigation.navigate('Store');
                } else if (item.label === 'Analysis') {
                    navigation.navigate('AnalysisView');
                } else {
                    Alert.alert('Category Pressed', `You clicked on ${item.label}`);
                }
            }}
        />
    );

    const renderLookingFor = ({ item }) => (
        <TouchableOpacity
            style={{
                flex: 1,
                margin: 5,
                backgroundColor: '#000',
                borderRadius: 10,
                padding: 10,
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onPress={() => {
                if (item.title === 'Courses') {
                    navigation.navigate('Store');
                } else if (item.title === '1:1 Consultation') {
                    navigation.navigate('Consultation');
                } else {
                    Alert.alert('Looking For Pressed', `You clicked on ${item.title}`);
                }
            }}
        >
            <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 5 }}>{item.title}</Text>
            <Image source={item.icon} style={{ width: 50, height: 50, tintColor: '#fff' }} />
        </TouchableOpacity>
    );

    const renderFreeVideo = ({ item }) => (
        <TouchableOpacity
            style={styles.videoItem}
            onPress={() => setPlayingVideo(item.videoUrl)}
        >
            <Image
                source={{ uri: item.thumbnail }}
                style={styles.videoThumbnail}
            />
            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.videoDuration}>{item.duration}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderPremiumCourse = ({ item }) => (
        <TouchableOpacity
            style={styles.premiumCourseCard}
            onPress={() => navigation.navigate('CourseDetail', { course: item })}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.premiumCourseThumbnail} />
            <View style={styles.premiumCourseTabs}>
                <Text style={styles.tabText}>LIVE CLASS</Text>
                <Text style={styles.tabText}>FILES</Text>
            </View>
            <Text style={styles.premiumCourseTitle}>{item.title}</Text>
            <View style={styles.discountContainer}>
                <Text style={styles.discountText}>Extra {item.discountPercent}% coupon discount</Text>
            </View>
            <View style={styles.priceContainer}>
                <Text style={styles.discountPrice}>₹{item.discountPrice}/-</Text>
                <Text style={styles.originalPrice}>₹{item.price}</Text>
                <Text style={styles.discountPercent}>{item.discountPercent}% OFF</Text>
            </View>
            <TouchableOpacity
                style={styles.getCourseButton}
                onPress={() => handlePurchaseCourse(item)}
            >
                <Text style={styles.getCourseButtonText}>Get this course</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderMenuItem = ({ item }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item.title)}
        >
            <Icon name={item.icon} size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.title}</Text>
            {item.new && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
        </TouchableOpacity>
    );

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={styles.notificationItem}
            onPress={() => setSelectedNotification(item)}
        >
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationDate}>
                {new Date(item.createdAt).toLocaleDateString()}
            </Text>
        </TouchableOpacity>
    );

    const renderSection = ({ item }) => {
        switch (item.type) {
            case 'banners':
                return (
                    <View style={{ padding: 10, marginTop: 5 }}>
                        <FlatList
                            data={banners}
                            renderItem={renderBanner}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                );
            case 'explore':
                return (
                    <View style={{ padding: 15 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', paddingVertical:24 }}>
                            Explore the Market with us!
                        </Text>
                        <FlatList
                            data={categories}
                            renderItem={renderCategory}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginTop: 10 }}
                        />
                    </View>
                );
            case 'lookingFor':
                return (
                    <View style={{ padding: 15 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>
                            What are you looking for?
                        </Text>
                        <FlatList
                            data={lookingFor}
                            renderItem={renderLookingFor}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
                        />
                    </View>
                );
            case 'promoBanner':
                return (
                    <PromoBanner
                        onPress={() => Alert.alert('Buy Now Pressed', 'Proceeding to purchase...')}
                    />
                );
            case 'freeVideos':
                return (
                    <View style={{ padding: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                                Free Videos
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('FreeCourses')}>
                                <Text style={{ fontSize: 14, color: '#4a6fa5' }}>
                                    See All <Icon name="arrow-forward" size={14} color="#4a6fa5" />
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={courses.filter(course => course.type === 'free')}
                            renderItem={renderFreeVideo}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: 10 }}
                        />
                        {playingVideo && (
                            <View style={styles.videoPlayerContainer}>
                                <Video
                                    source={{ uri: playingVideo }}
                                    style={styles.videoPlayer}
                                    controls={true}
                                    onError={(error) => {
                                        Alert.alert('Error', 'Failed to play video: ' + error.message);
                                        setPlayingVideo(null);
                                    }}
                                    onEnd={() => setPlayingVideo(null)}
                                />
                                <TouchableOpacity
                                    style={styles.closeVideoButton}
                                    onPress={() => setPlayingVideo(null)}
                                >
                                    <Text style={styles.closeVideoButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                );
            case 'featuredCourses':
                return (
                    <View style={{ padding: 15 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>
                            Featured Courses
                        </Text>
                        <FlatList
                            data={courses.filter(course => course.type === 'premium')}
                            renderItem={renderPremiumCourse}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                );
            case 'testimonials':
                return (
                    <TestimonialCard
                        onAdd={() => Alert.alert('Add Testimonial', 'Navigating to add testimonial form...')}
                    />
                );
            case 'socialMedia':
                return <SocialMediaLinks />;
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            
            <View style={styles.header}>
                <TouchableOpacity onPress={toggleMenu}>
                    <Icon name="menu" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>BTech Trader</Text>
                <TouchableOpacity onPress={() => setShowNotifications(true)}>
                    <View style={styles.notificationBell}>
                        <Icon name="notifications" size={24} color="#fff" />
                        {notifications.length > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            {/* Slide-In Menu */}
            {menuVisible && (
                <Animated.View
                    style={[
                        styles.menuContainer,
                        { transform: [{ translateX: slideAnim }] },
                    ]}
                >
                    <View style={styles.menuHeader}>
                        <Icon name="person" size={80} color="#666" style={styles.profileIcon} />
                        <Text style={styles.userName}>{user?.displayName || 'Shubh'}</Text>
                        {/* <Text style={styles.orgCode}>Organization Code RWIKCF</Text> */}
                        {/* <TouchableOpacity style={styles.addButton}>
                            <Text style={styles.addButtonText}>+ Add</Text>
                        </TouchableOpacity> */}
                    </View>
                    <FlatList
                        data={menuItems}
                        renderItem={renderMenuItem}
                        keyExtractor={(item) => item.id}
                        style={styles.menuList}
                    />
                    <TouchableOpacity style={styles.shareButton} onPress={handleShareOnFacebook}>
                        <Icon name="facebook" size={24} color="#fff" style={styles.shareIcon} />
                        <Text style={styles.shareText}>Share on Facebook</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Notification Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showNotifications}
                onRequestClose={() => setShowNotifications(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Notifications ({users.length} Users)</Text>
                        <FlatList
                            data={notifications}
                            renderItem={renderNotification}
                            keyExtractor={(item) => item.id}
                            style={styles.notificationList}
                        />
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setShowNotifications(false)}
                        >
                            <Text style={styles.closeModalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Full Notification Message Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!selectedNotification}
                onRequestClose={() => setSelectedNotification(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>{selectedNotification?.title}</Text>
                        <Text style={styles.modalMessage}>{selectedNotification?.message}</Text>
                        <Text style={styles.modalDate}>
                            {new Date(selectedNotification?.createdAt).toLocaleString()}
                        </Text>
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setSelectedNotification(null)}
                        >
                            <Text style={styles.closeModalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Payment WebView */}
            {showPaymentWebView && (
                <View style={styles.webViewContainer}>
                    <WebView
                        source={{ uri: paymentUrl }}
                        onNavigationStateChange={handleWebViewNavigationStateChange}
                        onMessage={handleWebViewMessage}
                        style={styles.webView}
                    />
                    <TouchableOpacity
                        style={styles.closeWebViewButton}
                        onPress={() => setShowPaymentWebView(false)}
                    >
                        <Text style={styles.closeWebViewButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Video Player */}
            {playingVideo && (
                <View style={styles.videoPlayerContainer}>
                    <Video
                        source={{ uri: playingVideo }}
                        style={styles.videoPlayer}
                        controls={true}
                        onError={(error) => {
                            Alert.alert('Error', 'Failed to play video: ' + error.message);
                            setPlayingVideo(null);
                        }}
                        onEnd={() => setPlayingVideo(null)}
                    />
                    <TouchableOpacity
                        style={styles.closeVideoButton}
                        onPress={() => setPlayingVideo(null)}
                    >
                        <Text style={styles.closeVideoButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Main Content */}
            <FlatList
                data={sections}
                renderItem={renderSection}
                keyExtractor={(item, index) => `${item.type}-${index}`}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#4a6fa5',
        padding: 30,
        paddingTop: 50,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    notificationBell: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 15,
        height: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    menuContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: Dimensions.get('window').width * 0.75,
        backgroundColor: '#fff',
        elevation: 5,
        zIndex: 10,
    },
    menuHeader: {
        paddingTop: 70,
        paddingBottom:70,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    profileIcon: {
        marginBottom: 10,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    orgCode: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#4a6fa5',
        padding: 5,
        borderRadius: 5,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    menuList: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuIcon: {
        marginRight: 10,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    newBadge: {
        backgroundColor: '#ff4444',
        borderRadius: 5,
        paddingHorizontal: 5,
        marginLeft: 10,
    },
    newBadgeText: {
        color: '#fff',
        fontSize: 10,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#3b5998',
        margin: 10,
        borderRadius: 5,
    },
    shareIcon: {
        marginRight: 10,
    },
    shareText: {
        color: '#fff',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '80%',
    },
    modalHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    notificationList: {
        maxHeight: 300,
    },
    notificationItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    notificationTitle: {
        fontSize: 16,
        color: '#333',
    },
    notificationDate: {
        fontSize: 12,
        color: '#666',
    },
    modalMessage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    modalDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    closeModalButton: {
        backgroundColor: '#4a6fa5',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeModalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    webViewContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 20,
    },
    webView: {
        flex: 1,
    },
    closeWebViewButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#ff4444',
        padding: 10,
        borderRadius: 5,
    },
    closeWebViewButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    videoPlayerContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 30,
    },
    videoPlayer: {
        width: '80%',
        height: '60%',
    },
    closeVideoButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#ff4444',
        padding: 10,
        borderRadius: 5,
    },
    closeVideoButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    videoItem: {
        marginRight: 10,
        width: 200,
    },
    videoThumbnail: {
        width: '100%',
        height: 120,
        borderRadius: 10,
    },
    videoInfo: {
        padding: 5,
    },
    videoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    videoDuration: {
        fontSize: 12,
        color: '#666',
    },
    premiumCourseCard: {
        marginRight: 10,
        width: 250,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        elevation: 3,
        height:390,
    },
    premiumCourseThumbnail: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    premiumCourseTabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    tabText: {
        fontSize: 10,
        color: '#fff',
        backgroundColor: '#4a6fa5',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 5,
    },
    premiumCourseTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 5,
    },
    discountContainer: {
        backgroundColor: '#ffeb3b',
        padding: 5,
        borderRadius: 5,
    },
    discountText: {
        fontSize: 10,
        color: '#333',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff4444',
        marginRight: 10,
    },
    originalPrice: {
        fontSize: 12,
        color: '#666',
        textDecorationLine: 'line-through',
    },
    discountPercent: {
        fontSize: 12,
        color: '#666',
    },
    getCourseButton: {
        backgroundColor: '#4a6fa5',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    getCourseButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});