const express = require('express');
const router = express.Router();
const { authenticateToken, requireReceptionist, requireStaff } = require('../middleware/auth');
const {
  generateBill,
  getBillByVisit,
  getPatientBills,
  getCompletedVisits,
  getBillingSummary
} = require('../controllers/billingController');

// All routes require authentication
router.use(authenticateToken);

// Generate bill for visit (receptionist only)
router.post('/', requireReceptionist, generateBill);

// Get bill by visit ID (both doctor and receptionist)
router.get('/visit/:visitId', requireStaff, getBillByVisit);

// Get all bills for a patient (both doctor and receptionist)
router.get('/patient/:patientId', requireStaff, getPatientBills);

// Get completed visits ready for billing (receptionist only)
router.get('/completed', requireReceptionist, getCompletedVisits);

// Get billing summary (receptionist only)
router.get('/summary', requireReceptionist, getBillingSummary);

module.exports = router; 