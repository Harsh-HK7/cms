const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging .env File');
console.log('======================\n');

const envPath = path.join(__dirname, '.env');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('Please create it first: cp env.example .env');
  process.exit(1);
}

console.log('✅ .env file exists\n');

// Read .env content
const envContent = fs.readFileSync(envPath, 'utf8');

// Check for private key
const privateKeyMatch = envContent.match(/FIREBASE_PRIVATE_KEY="([^"]+)"/);
if (!privateKeyMatch) {
  console.log('❌ FIREBASE_PRIVATE_KEY not found in .env file');
  console.log('Make sure you have: FIREBASE_PRIVATE_KEY="your-key-here"');
  process.exit(1);
}

const privateKey = privateKeyMatch[1];
console.log('✅ FIREBASE_PRIVATE_KEY found\n');

// Check private key format
console.log('🔍 Private Key Analysis:');
console.log('========================');

// Check if it starts correctly
if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
  console.log('❌ Private key does NOT start with "-----BEGIN PRIVATE KEY-----"');
  console.log('Current start:', privateKey.substring(0, 50) + '...');
} else {
  console.log('✅ Private key starts correctly');
}

// Check if it ends correctly
if (!privateKey.includes('-----END PRIVATE KEY-----')) {
  console.log('❌ Private key does NOT end with "-----END PRIVATE KEY-----"');
  console.log('Current end:', '...' + privateKey.substring(privateKey.length - 50));
} else {
  console.log('✅ Private key ends correctly');
}

// Check length
console.log(`📏 Private key length: ${privateKey.length} characters`);

// Check for newlines
const newlineCount = (privateKey.match(/\\n/g) || []).length;
console.log(`📝 Newline characters (\\n): ${newlineCount}`);

// Show first and last 100 characters
console.log('\n📋 First 100 characters:');
console.log(privateKey.substring(0, 100));
console.log('\n📋 Last 100 characters:');
console.log(privateKey.substring(privateKey.length - 100));

console.log('\n🔧 How to Fix:');
console.log('==============');
console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
console.log('2. Click "Generate new private key"');
console.log('3. Download the JSON file');
console.log('4. Copy the "private_key" value from the JSON');
console.log('5. Replace the FIREBASE_PRIVATE_KEY in your .env file');
console.log('6. Make sure to keep the quotes and \\n characters');

console.log('\n📝 Example format:');
console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"'); 