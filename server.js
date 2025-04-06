const express = require('express');
const Razorpay = require('razorpay');
const multer = require('multer');
const cloudinary = require('./cloudinaryConfig');
const { admin, db } = require('./firebaseAdminConfig');
const session = require('express-session');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session middleware
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
]);

// Nodemailer setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'rkinstitute85@gmail.com',
        pass: 'hchdlojdrkwtacnx',
    },
});

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Admin login page
app.get('/admin/login', (req, res) => {
    res.render('adminLogin', { error: null });
});

// Admin login (verify with Firebase Admin SDK)
app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await admin.auth().getUserByEmail(email);
        const customClaims = user.customClaims || {};

        if (customClaims.admin) {
            req.session.isAdmin = true;
            res.redirect('/admin/dashboard');
        } else {
            res.render('adminLogin', { error: 'You are not an admin' });
        }
    } catch (error) {
        res.render('adminLogin', { error: 'Invalid credentials' });
    }
});

// Admin dashboard
app.get('/admin/dashboard', isAdmin, async (req, res) => {
    try {
        const usersSnapshot = await db.ref('users').once('value');
        const usersData = usersSnapshot.val() || {};
        const users = Object.values(usersData).map(user => ({
            id: user.uid || user.id || usersSnapshot.key,
            name: user.name || 'Unnamed User',
            email: user.email || 'No email',
            orgCode: user.orgCode || 'N/A'
        }));
        console.log('Fetched users:', users);

        const coursesSnapshot = await db.ref('courses').once('value');
        const courses = coursesSnapshot.val() ? Object.values(coursesSnapshot.val()) : [];

        const bannersSnapshot = await db.ref('banners').once('value');
        const banners = bannersSnapshot.val() ? Object.values(bannersSnapshot.val()) : [];

        // Fetch all certificates
        const certificatesSnapshot = await db.ref('userCertificates').once('value');
        const certificatesData = certificatesSnapshot.val() || {};
        const certificates = [];
        for (const userId in certificatesData) {
            const userCerts = certificatesData[userId];
            const user = users.find(u => u.id === userId) || { name: 'Unknown', email: 'No email' };
            Object.values(userCerts).forEach(cert => {
                certificates.push({
                    id: cert.id,
                    title: cert.title,
                    type: cert.certificateUrl ? 'certificate' : 'video',
                    certificateUrl: cert.certificateUrl || null,
                    thumbnailUrl: cert.thumbnailUrl || null,
                    videoUrl: cert.videoUrl || null,
                    createdAt: cert.createdAt,
                    userName: user.name,
                    userEmail: user.email
                });
            });
        }

        res.render('adminDashboard', { users, courses, banners, certificates });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('adminDashboard', { users: [], courses: [], banners: [], certificates: [], error: 'Failed to load data' });
    }
});

// Upload course or banner to Cloudinary and save metadata to Firebase
app.post('/admin/upload', isAdmin, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.redirect('/admin/dashboard?error=' + encodeURIComponent('Upload failed: ' + err.message));
        }

        try {
            const { title, type, price, discountPrice, discountPercent, mode, likes, couponCode, description } = req.body;

            if (!title || !type) {
                throw new Error('Title and type are required');
            }

            let thumbnailUrl = '';
            let videoUrl = '';

            if (req.files['thumbnail']) {
                const thumbnailFile = req.files['thumbnail'][0];
                const thumbnailResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(thumbnailFile.buffer);
                });
                thumbnailUrl = thumbnailResult.secure_url;
            } else {
                throw new Error('Thumbnail is required');
            }

            if (req.files['video'] && type !== 'banner') {
                const videoFile = req.files['video'][0];
                const videoResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'video' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(videoFile.buffer);
                });
                videoUrl = videoResult.secure_url;
            }

            const refPath = type === 'banner' ? 'banners' : 'courses';
            const newItemRef = db.ref(refPath).push();
            const itemData = {
                id: newItemRef.key,
                title,
                type,
                createdAt: Date.now(),
            };

            if (type === 'banner') {
                itemData.image = thumbnailUrl;
            } else {
                itemData.thumbnail = thumbnailUrl;
                itemData.video = videoUrl;
                if (type === 'premium') {
                    itemData.price = price || 0;
                    itemData.discountPrice = discountPrice || 0;
                    itemData.discountPercent = discountPercent || 0;
                    itemData.mode = mode || 'Online';
                    itemData.likes = parseInt(likes) || 0;
                    itemData.couponCode = couponCode || '';
                    itemData.description = description || '';
                }
            }

            await newItemRef.set(itemData);
            res.redirect('/admin/dashboard?success=Upload successful');
        } catch (error) {
            console.error('Upload error:', error);
            res.redirect('/admin/dashboard?error=' + encodeURIComponent('Upload failed: ' + error.message));
        }
    });
});

// Upload certificate or video for a specific user
app.post('/admin/upload-certificate-video', isAdmin, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.redirect('/admin/dashboard?error=' + encodeURIComponent('Upload failed: ' + err.message));
        }

        try {
            const { title, userId, type } = req.body;

            if (!title || !userId || !type) {
                throw new Error('Title, user selection, and type are required');
            }

            let certificateUrl = '';
            let thumbnailUrl = '';
            let videoUrl = '';

            if (type === 'certificate') {
                if (!req.files['certificate']) {
                    throw new Error('Certificate PDF is required');
                }
                const certificateFile = req.files['certificate'][0];
                const certificateResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'raw' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(certificateFile.buffer);
                });
                certificateUrl = certificateResult.secure_url;
            } else if (type === 'video') {
                if (!req.files['thumbnail'] || !req.files['video']) {
                    throw new Error('Thumbnail and video are required for video upload');
                }
                const thumbnailFile = req.files['thumbnail'][0];
                const thumbnailResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(thumbnailFile.buffer);
                });
                thumbnailUrl = thumbnailResult.secure_url;

                const videoFile = req.files['video'][0];
                const videoResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'video' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(videoFile.buffer);
                });
                videoUrl = videoResult.secure_url;
            } else {
                throw new Error('Invalid type selected');
            }

            const newItemRef = db.ref(`userCertificates/${userId}`).push();
            const itemData = {
                id: newItemRef.key,
                title,
                createdAt: Date.now(),
            };

            if (type === 'certificate') {
                itemData.certificateUrl = certificateUrl;
            } else if (type === 'video') {
                itemData.thumbnailUrl = thumbnailUrl;
                itemData.videoUrl = videoUrl;
            }

            await newItemRef.set(itemData);
            res.redirect('/admin/dashboard?success=' + encodeURIComponent(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`));
        } catch (error) {
            console.error(`${type} upload error:`, error);
            res.redirect('/admin/dashboard?error=' + encodeURIComponent(`Upload failed: ${error.message}`));
        }
    });
});

// Delete certificate or video
app.post('/admin/certificates/delete/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Find and delete the certificate/video (note: this is a simplified approach)
        const certificatesSnapshot = await db.ref('userCertificates').once('value');
        const certificatesData = certificatesSnapshot.val() || {};
        let found = false;
        for (const userId in certificatesData) {
            const userCerts = certificatesData[userId];
            for (const certId in userCerts) {
                if (certId === id) {
                    await db.ref(`userCertificates/${userId}/${certId}`).remove();
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (!found) throw new Error('Certificate/Video not found');
        res.redirect('/admin/dashboard?success=Certificate/Video deleted successfully');
    } catch (error) {
        res.redirect('/admin/dashboard?error=Failed to delete certificate/video: ' + error.message);
    }
});

// Edit user
app.post('/admin/users/edit/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        await db.ref(`users/${id}`).update({ name });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.redirect('/admin/dashboard?error=Failed to update user');
    }
});

// Delete user
app.post('/admin/users/delete/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`users/${id}`).remove();
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.redirect('/admin/dashboard?error=Failed to delete user');
    }
});

// Edit course
app.post('/admin/courses/edit/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price, discountPrice, discountPercent, mode, likes, couponCode, description } = req.body;
        const updateData = { title };
        if (price) updateData.price = price;
        if (discountPrice) updateData.discountPrice = discountPrice;
        if (discountPercent) updateData.discountPercent = discountPercent;
        if (mode) updateData.mode = mode;
        if (likes) updateData.likes = parseInt(likes);
        if (couponCode) updateData.couponCode = couponCode;
        if (description) updateData.description = description;
        await db.ref(`courses/${id}`).update(updateData);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.redirect('/admin/dashboard?error=Failed to update course');
    }
});

// Delete course
app.post('/admin/courses/delete/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`courses/${id}`).remove();
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.redirect('/admin/dashboard?error=Failed to delete course');
    }
});

// Edit banner
app.post('/admin/banners/edit/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        await db.ref(`banners/${id}`).update({ title });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.redirect('/admin/dashboard?error=Failed to update banner');
    }
});

// Delete banner
app.post('/admin/banners/delete/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`banners/${id}`).remove();
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.redirect('/admin/dashboard?error=Failed to delete banner');
    }
});

// Logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// API endpoints for the client-side app
app.get('/admin/users', async (req, res) => {
    try {
        const snapshot = await db.ref('users').once('value');
        const users = snapshot.val() || {};
        res.status(200).json(Object.values(users));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
});

app.get('/admin/courses', async (req, res) => {
    try {
        const snapshot = await db.ref('courses').once('value');
        const courses = snapshot.val() || {};
        res.status(200).json(Object.values(courses));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
    }
});

app.get('/admin/banners', async (req, res) => {
    try {
        const snapshot = await db.ref('banners').once('value');
        const banners = snapshot.val() || {};
        res.status(200).json(Object.values(banners));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch banners', error: error.message });
    }
});

// Upload notification
app.post('/admin/upload-notification', isAdmin, async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            throw new Error('Title and message are required');
        }

        const newNotificationRef = db.ref('notifications').push();
        const notificationData = {
            id: newNotificationRef.key,
            title,
            message,
            createdAt: Date.now(),
        };

        await newNotificationRef.set(notificationData);
        res.redirect('/admin/dashboard?success=Notification uploaded successfully');
    } catch (error) {
        console.error('Notification upload error:', error);
        res.redirect('/admin/dashboard?error=' + encodeURIComponent('Notification upload failed: ' + error.message));
    }
});

// Handle purchase notification and send emails
app.post('/notify-purchase', async (req, res) => {
    const { userId, userEmail, userName, courseTitle, coursePrice, token } = req.body;
    console.log('Received notify-purchase request:', req.body);

    if (!userId || !userEmail || !userName || !courseTitle || !coursePrice || !token) {
        console.error('Missing required fields in notify-purchase request');
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        console.log('Sending email to user:', userEmail);
        const userMailInfo = await transporter.sendMail({
            from: '"BTech Trader" <rkinstitute85@gmail.com>',
            to: userEmail,
            subject: 'Course Purchase Confirmation',
            text: `Dear ${userName},\n\nYou have successfully purchased the course "${courseTitle}".\nYour unique token number is: ${token}\n\nThank you for choosing BTech Trader!`,
        });
        console.log('Email sent to user successfully:', userMailInfo.messageId);

        console.log('Sending email to admin: fakeclub256@gmail.com');
        const adminMailInfo = await transporter.sendMail({
            from: '"BTech Trader" <rkinstitute85@gmail.com>',
            to: 'fakeclub256@gmail.com',
            subject: 'New Course Purchase Notification',
            text: `A user has purchased a course.\n\nDetails:\n- User: ${userName}\n- Email: ${userEmail}\n- Course: ${courseTitle}\n- Price: ₹${coursePrice}\n- Token: ${token}\n\nInvoice:\nCourse: ${courseTitle}\nPrice: ₹${coursePrice}\nToken: ${token}`,
        });
        console.log('Email sent to admin successfully:', adminMailInfo.messageId);

        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ message: 'Failed to send emails', error: error.message });
    }
});

const razorpay = new Razorpay({
    key_id: 'rzp_test_gp96uKYK1wp4hS',
    key_secret: 'CrTK2UUkDVulKrpVUjSvzSC6',
});

app.post('/create-order', async (req, res) => {
    const { amount } = req.body;
    console.log('Received create-order request:', req.body);

    const options = {
        amount: amount * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        console.log('Order created successfully:', order);
        res.json({ orderId: order.id });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});