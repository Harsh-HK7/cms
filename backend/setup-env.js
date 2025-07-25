const fs = require('fs');
const path = require('path');

console.log('🔧 Firebase .env Setup Helper');
console.log('==============================\n');

console.log('📋 Instructions:');
console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
console.log('2. Click "Generate new private key"');
console.log('3. Save the JSON file in this directory (backend/)');
console.log('4. Run this script again with the JSON filename as argument');
console.log('   Example: node setup-env.js your-service-account.json\n');

// Check if JSON file is provided
const jsonFile = process.argv[2];
if (!jsonFile) {
  console.log('❌ No JSON file specified!');
  console.log('Usage: node setup-env.js your-service-account.json');
  process.exit(1);
}

const jsonPath = path.join(__dirname, jsonFile);

// Check if JSON file exists
if (!fs.existsSync(jsonPath)) {
  console.log(`❌ File not found: ${jsonFile}`);
  console.log('Make sure the JSON file is in the backend directory');
  process.exit(1);
}

try {
  // Read and parse JSON
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const serviceAccount = JSON.parse(jsonContent);

  // Create .env content
  const envContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\n/g, '\\n')}"
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_CLIENT_ID=${serviceAccount.client_id}
FIREBASE_AUTH_URI=${serviceAccount.auth_uri}
FIREBASE_TOKEN_URI=${serviceAccount.token_uri}
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=${serviceAccount.auth_provider_x509_cert_url}
FIREBASE_CLIENT_X509_CERT_URL=${serviceAccount.client_x509_cert_url}

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
`;

  // Write .env file
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);

  console.log('✅ .env file created successfully!');
  console.log('📁 File location:', envPath);
  console.log('\n🔐 Security Note:');
  console.log('- Delete the JSON file after creating .env');
  console.log('- Never commit .env or JSON files to git');
  console.log('- Keep your private keys secure\n');

  console.log('🚀 You can now start the server:');
  console.log('npm run dev');

} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\nMake sure the JSON file is a valid Firebase service account file');
} 