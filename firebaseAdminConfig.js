const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://trading-afe83-default-rtdb.firebaseio.com/",
    });
}

const db = admin.database();
module.exports = { admin, db };