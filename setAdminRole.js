const { admin } = require('./firebaseAdminConfig');

async function setAdminRole() {
    try {
        const user = await admin.auth().getUserByEmail('fakeclub256@gmail.com');
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        console.log('Admin role set for user:', user.email);
    } catch (error) {
        console.error('Error setting admin role:', error);
    }
}

setAdminRole();