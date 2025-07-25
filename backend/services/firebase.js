const admin = require('firebase-admin');
const { logDatabase } = require('./logger');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Validate required environment variables
      const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_CLIENT_ID'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }

      // Validate private key format
      if (!process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Invalid private key format. Make sure it starts with "-----BEGIN PRIVATE KEY-----"');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          clientId: process.env.FIREBASE_CLIENT_ID,
          authUri: process.env.FIREBASE_AUTH_URI,
          tokenUri: process.env.FIREBASE_TOKEN_URI,
          authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
          clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
      
      logDatabase('info', 'Firebase Admin SDK initialized successfully');
    }
    
    return admin;
  } catch (error) {
    logDatabase('error', 'Failed to initialize Firebase Admin SDK', { error: error.message });
    
    // Provide helpful error messages
    if (error.message.includes('private key')) {
      console.error('\n🔑 Firebase Private Key Error:');
      console.error('Please check your .env file and ensure:');
      console.error('1. FIREBASE_PRIVATE_KEY is properly formatted');
      console.error('2. The key includes "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----"');
      console.error('3. Newlines are represented as \\n');
      console.error('\nRun: node fix-private-key.js for help\n');
    } else if (error.message.includes('Missing required')) {
      console.error('\n📝 Missing Environment Variables:');
      console.error('Please check your .env file and ensure all Firebase variables are set');
      console.error('\nRun: node fix-private-key.js for help\n');
    }
    
    throw error;
  }
};

// Get Firestore instance
const getFirestore = () => {
  const admin = initializeFirebase();
  return admin.firestore();
};

// Get Auth instance
const getAuth = () => {
  const admin = initializeFirebase();
  return admin.auth();
};

// Helper function to verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    logDatabase('info', 'Firebase ID token verified successfully', { uid: decodedToken.uid });
    return decodedToken;
  } catch (error) {
    logDatabase('error', 'Failed to verify Firebase ID token', { error: error.message });
    throw error;
  }
};

// Helper function to get user role from Firestore
const getUserRole = async (uid) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      logDatabase('warn', 'User document not found', { uid });
      return null;
    }
    
    const userData = userDoc.data();
    logDatabase('info', 'User role retrieved successfully', { uid, role: userData.role });
    return userData.role;
  } catch (error) {
    logDatabase('error', 'Failed to get user role', { uid, error: error.message });
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  verifyIdToken,
  getUserRole
}; 