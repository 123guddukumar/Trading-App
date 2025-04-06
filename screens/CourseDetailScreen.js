import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth } from '../firebaseConfig'; // Import Firebase auth to get the current user
import { database } from '../firebaseConfig'; // Import Firebase database
import { ref, set } from 'firebase/database';

export default function CourseDetailScreen({ route, navigation }) {
    const { course } = route.params;

    // State variables for payment
    const [user, setUser] = useState(null);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [showPaymentWebView, setShowPaymentWebView] = useState(false);

    // Fetch the current user when the component mounts
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    const handleBuyNow = async (course) => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in to purchase a course.');
            navigation.navigate('Login');
            return;
        }

        try {
            // Store the current course being purchased
            setCurrentCourse(course);

            // Step 1: Fetch the order_id from the server
            console.log('Fetching order from server...');
            const response = await fetch('https://trading-app-1-nag0.onrender.com/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: course.discountPrice, // Amount in INR
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

            // Step 2: Construct the Razorpay checkout URL
            const razorpayKey = 'rzp_test_gp96uKYK1wp4hS'; // Updated Razorpay key
            const paymentOptions = {
                key: razorpayKey,
                amount: course.discountPrice * 100, // Amount in paise
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

            // Step 3: Create a URL-encoded form body for the WebView
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

            // Step 4: Construct the HTML to load Razorpay checkout
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

            // Step 5: Show the WebView with the Razorpay checkout
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
            return; // Ignore initial URL
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
                // Save the purchase in Firebase
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

                // Notify the server
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

                // Redirect to PremiumCourses screen
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

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Course Title */}
                <Text style={styles.title}>{course.title}</Text>

                {/* Course Mode and Likes */}
                <View style={styles.modeContainer}>
                    <Text style={styles.mode}>Mode: {course.mode || 'Online'}</Text>
                    <View style={styles.likesContainer}>
                        <Icon name="favorite" size={20} color="#FF3B30" />
                        <Text style={styles.likes}>{course.likes || 0} Likes</Text>
                    </View>
                </View>

                {/* Course Thumbnail */}
                <Image
                    source={{ uri: course.thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />

                {/* Available Offer */}
                <View style={styles.offerContainer}>
                    <Text style={styles.offerTitle}>Available Offer</Text>
                    <Text style={styles.couponCode}>
                        Use Coupon: {course.couponCode || 'Not Available'}
                    </Text>
                </View>

                {/* Course Description */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionTitle}>Description</Text>
                    <Text style={styles.description}>{course.description || 'No description available.'}</Text>
                </View>
            </ScrollView>

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

            {/* Fixed Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.priceSection}>
                    <Text style={styles.price}>₹{course.discountPrice}</Text>
                    <Text style={styles.originalPrice}>₹{course.price}</Text>
                </View>
                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handleBuyNow(course)}
                >
                    <Text style={styles.buyButtonText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 100, // Extra padding to ensure content is not hidden behind the bottom bar
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    modeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    mode: {
        fontSize: 16,
        color: '#666',
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likes: {
        fontSize: 16,
        color: '#666',
        marginLeft: 5,
    },
    thumbnail: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    offerContainer: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    offerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    couponCode: {
        fontSize: 16,
        color: '#007BFF',
    },
    descriptionContainer: {
        marginBottom: 20,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    priceSection: {
        flexDirection: 'column',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    buyButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    buyButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    webViewContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    webView: {
        width: Dimensions.get('window').width * 0.9,
        height: 400,
    },
    closeWebViewButton: {
        backgroundColor: '#FF0000',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    closeWebViewButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});