// const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json');

// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//         databaseURL: "https://trading-afe83-default-rtdb.firebaseio.com/",
//     });
// }

// const db = admin.database();
// module.exports = { admin, db };





const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables from .env

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            type: process.env.TYPE,
            project_id: process.env.PROJECT_ID,
            private_key_id: process.env.PRIVATE_KEY_ID,
            private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
            client_email: process.env.CLIENT_EMAIL,
            client_id: process.env.CLIENT_ID,
            auth_uri: process.env.AUTH_URI,
            token_uri: process.env.TOKEN_URI,
            auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
            universe_domain: process.env.UNIVERSE_DOMAIN,
        }),
        databaseURL: "https://trading-afe83-default-rtdb.firebaseio.com/",
    });
}

const db = admin.database();
module.exports = { admin, db };