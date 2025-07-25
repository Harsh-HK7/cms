const { getFirestore } = require('./firebase');
const { logBusiness } = require('./logger');

// Generate a unique token for new patient visits
const generateToken = async () => {
  try {
    const db = getFirestore();
    
    // Get the current token counter
    const counterDoc = await db.collection('counters').doc('token').get();
    
    let currentToken = 1;
    if (counterDoc.exists) {
      currentToken = counterDoc.data().current + 1;
    }
    
    // Update the counter
    await db.collection('counters').doc('token').set({
      current: currentToken,
      lastUpdated: new Date()
    });
    
    logBusiness('info', 'Token generated successfully', { token: currentToken });
    return currentToken;
  } catch (error) {
    logBusiness('error', 'Failed to generate token', { error: error.message });
    throw error;
  }
};

// Get the current token number (for display purposes)
const getCurrentToken = async () => {
  try {
    const db = getFirestore();
    const counterDoc = await db.collection('counters').doc('token').get();
    
    if (counterDoc.exists) {
      return counterDoc.data().current;
    }
    return 0;
  } catch (error) {
    logBusiness('error', 'Failed to get current token', { error: error.message });
    throw error;
  }
};

// Reset token counter (admin function)
const resetTokenCounter = async (newValue = 0) => {
  try {
    const db = getFirestore();
    await db.collection('counters').doc('token').set({
      current: newValue,
      lastUpdated: new Date()
    });
    
    logBusiness('info', 'Token counter reset successfully', { newValue });
    return newValue;
  } catch (error) {
    logBusiness('error', 'Failed to reset token counter', { error: error.message });
    throw error;
  }
};

module.exports = {
  generateToken,
  getCurrentToken,
  resetTokenCounter
}; 