# Direction - Clinic Management System

A comprehensive clinic management system designed to streamline communication between doctors and receptionists, with automated token generation, patient management, prescription handling, and billing capabilities.

## 🏥 Features

### Core Functionality
- **User Authentication**: Firebase-based authentication with role-based access
- **Patient Management**: Register and manage patient information
- **Token Generation**: Automatic token assignment for patient visits
- **Prescription Management**: Doctors can add prescriptions for patients
- **Billing System**: Generate bills based on prescriptions
- **Patient History**: Complete visit and prescription history tracking
- **Role-Based Access**: Separate interfaces for doctors and receptionists

### User Roles
- **Doctor**: View patients, add prescriptions, manage pending visits
- **Receptionist**: Register patients, generate bills, manage completed visits

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Firebase** (Firestore + Authentication)
- **Winston** for logging
- **Joi** for validation
- **Helmet** for security

### Frontend
- **React 18** with Vite
- **Tailwind CSS 3.4.17**
- **React Router** for navigation
- **Firebase SDK** for authentication
- **Axios** for API communication
- **Lucide React** for icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore and Authentication enabled

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd direction-clinic
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database (start in test mode)
4. Enable Authentication with Email/Password
5. Create service account and download JSON key

#### Add Users to Firebase
1. In Authentication > Users, add users manually:
   - Doctor: `doctor@clinic.com` / `password123`
   - Receptionist: `receptionist@clinic.com` / `password123`

2. In Firestore, create a `users` collection with documents:
   ```json
   // Document ID: [user-uid-from-auth]
   {
     "email": "doctor@clinic.com",
     "role": "doctor"
   }
   ```

### 3. Backend Setup
```bash
cd backend
npm install
```

#### Environment Configuration
1. Copy `env.example` to `.env`
2. Update Firebase configuration with your service account details:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

#### Firebase Configuration
Update `src/config/firebase.js` with your Firebase web app configuration:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📚 API Endpoints

### Authentication
All endpoints require Firebase ID token in Authorization header: `Bearer <token>`

### Patients
- `POST /api/patients` - Register new patient (Receptionist)
- `GET /api/patients` - Get all patients (Both roles)
- `GET /api/patients/:id` - Get patient by ID (Both roles)
- `GET /api/patients/:id/history` - Get patient history (Both roles)
- `GET /api/patients/search?query=name` - Search patients (Both roles)

### Prescriptions
- `POST /api/prescriptions` - Add prescription (Doctor)
- `GET /api/prescriptions/visit/:id` - Get prescription by visit (Both roles)
- `GET /api/prescriptions/patient/:id` - Get patient prescriptions (Both roles)
- `GET /api/prescriptions/pending` - Get pending visits (Doctor)

### Billing
- `POST /api/billing` - Generate bill (Receptionist)
- `GET /api/billing/visit/:id` - Get bill by visit (Both roles)
- `GET /api/billing/patient/:id` - Get patient bills (Both roles)
- `GET /api/billing/completed` - Get completed visits (Receptionist)
- `GET /api/billing/summary` - Get billing summary (Receptionist)

## 🗄️ Database Schema

### Collections

#### users
```json
{
  "email": "string",
  "role": "doctor" | "receptionist"
}
```

#### patients
```json
{
  "name": "string",
  "age": "number",
  "bloodGroup": "A+|A-|B+|B-|AB+|AB-|O+|O-",
  "contact": "string",
  "disease": "string",
  "createdAt": "timestamp",
  "createdBy": "string (uid)",
  "lastVisit": "timestamp"
}
```

#### visits
```json
{
  "patientId": "string",
  "token": "number",
  "visitDate": "timestamp",
  "status": "registered|completed",
  "createdBy": "string (uid)",
  "prescription": "object|null",
  "billing": "object|null"
}
```

#### counters
```json
{
  "current": "number",
  "lastUpdated": "timestamp"
}
```

## 🔐 Security Features

- Firebase Authentication with role-based access
- JWT token validation
- Input validation with Joi
- Rate limiting
- CORS protection
- Helmet security headers
- Comprehensive logging

## 📝 Logging

All actions are logged to files in `backend/logs/`:
- `error.log` - Error logs
- `combined.log` - All logs
- `api.log` - API request logs

## 🧪 Testing

To add testing later:
```bash
# Backend testing
cd backend
npm test

# Frontend testing
cd frontend
npm test
```

## 📦 Project Structure

```
direction-clinic/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── logs/
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── config/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Updates

- Keep Firebase dependencies updated
- Regularly update Node.js and npm packages
- Monitor security advisories
- Backup Firestore data regularly 