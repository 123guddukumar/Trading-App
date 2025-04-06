const { admin } = require('./firebaseAdminConfig');

async function setAdminRole() {
    try {
        console.log('Attempting to get user by email: fakeclub256@gmail.com');
        const user = await admin.auth().getUserByEmail('fakeclub256@gmail.com');
        console.log('User found:', user.uid, user.email);
        console.log('Setting custom claims...');
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        console.log('Admin role set for user:', user.email);
    } catch (error) {
        console.error('Error setting admin role:', error.message, error.stack);
    }
}

setAdminRole();






// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../firebase/firebaseConfig';

// const handleSignup = async () => {
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, 'fakeclub256@gmail.com', 'Guddu123@');
//         console.log('User created:', userCredential.user);
//     } catch (error) {
//         console.error('Error creating user:', error);
//     }
// };