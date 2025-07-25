const express = require('express');
const router = express.Router();
const { authenticateToken, requireDoctor, requireStaff } = require('../middleware/auth');
const {
  addPrescription,
  getPrescriptionByVisit,
  getPatientPrescriptions,
  getPendingVisits
} = require('../controllers/prescriptionController');

// All routes require authentication
router.use(authenticateToken);

// Add prescription to visit (doctor only)
router.post('/', requireDoctor, addPrescription);

// Get prescription by visit ID (both doctor and receptionist)
router.get('/visit/:visitId', requireStaff, getPrescriptionByVisit);

// Get all prescriptions for a patient (both doctor and receptionist)
router.get('/patient/:patientId', requireStaff, getPatientPrescriptions);

// Get pending visits for doctor (doctor only)
router.get('/pending', requireDoctor, getPendingVisits);

module.exports = router; 