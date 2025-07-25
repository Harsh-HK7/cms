const express = require('express');
const router = express.Router();
const { authenticateToken, requireReceptionist, requireStaff } = require('../middleware/auth');
const {
  registerPatient,
  getAllPatients,
  getPatientById,
  getPatientHistory,
  searchPatients
} = require('../controllers/patientController');

// All routes require authentication
router.use(authenticateToken);

// Register new patient (receptionist only)
router.post('/', requireReceptionist, registerPatient);

// Get all patients (both doctor and receptionist)
router.get('/', requireStaff, getAllPatients);

// Get patient by ID (both doctor and receptionist)
router.get('/:patientId', requireStaff, getPatientById);

// Get patient history (both doctor and receptionist)
router.get('/:patientId/history', requireStaff, getPatientHistory);

// Search patients (both doctor and receptionist)
router.get('/search', requireStaff, searchPatients);

module.exports = router; 