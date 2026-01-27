// firebase.js
import admin from "firebase-admin";

// Base64 decode karo
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_CREDENTIALS, "base64").toString("utf8")
);

// Firebase initialize karo
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
