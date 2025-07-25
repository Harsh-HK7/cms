const { getFirestore } = require('../services/firebase');
const { logBusiness } = require('../services/logger');
const Joi = require('joi');

// Validation schema for billing
const billingSchema = Joi.object({
  visitId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().optional().max(500)
});

// Generate bill for a visit
const generateBill = async (req, res) => {
  try {
    const { error, value } = billingSchema.validate(req.body);
    if (error) {
      logBusiness('warn', 'Billing validation failed', { error: error.details[0].message });
      return res.status(400).json({ error: error.details[0].message });
    }

    const db = getFirestore();
    
    // Check if visit exists and get patient info
    const visitDoc = await db.collection('visits').doc(value.visitId).get();
    if (!visitDoc.exists) {
      logBusiness('warn', 'Visit not found for billing', { visitId: value.visitId });
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visitData = visitDoc.data();
    
    // Check if prescription exists (bill can only be generated after prescription)
    if (!visitData.prescription) {
      logBusiness('warn', 'No prescription found for billing', { visitId: value.visitId });
      return res.status(400).json({ error: 'Prescription must be added before generating bill' });
    }
    
    // Check if bill already exists
    if (visitData.billing) {
      logBusiness('warn', 'Bill already exists for visit', { visitId: value.visitId });
      return res.status(400).json({ error: 'Bill already exists for this visit' });
    }

    // Get patient info
    const patientDoc = await db.collection('patients').doc(visitData.patientId).get();
    const patientData = patientDoc.data();

    // Create billing data
    const billingData = {
      ...value,
      patientId: visitData.patientId,
      patientName: patientData.name,
      token: visitData.token,
      visitDate: visitData.visitDate,
      prescription: visitData.prescription,
      createdAt: new Date(),
      createdBy: req.user.uid
    };

    // Update visit with billing
    await db.collection('visits').doc(value.visitId).update({
      billing: billingData,
      updatedAt: new Date()
    });

    logBusiness('info', 'Bill generated successfully', { 
      visitId: value.visitId, 
      patientId: visitData.patientId,
      amount: value.amount,
      createdBy: req.user.uid 
    });

    res.status(201).json({
      message: 'Bill generated successfully',
      bill: billingData
    });

  } catch (error) {
    logBusiness('error', 'Failed to generate bill', { 
      error: error.message, 
      createdBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to generate bill' });
  }
};

// Get bill by visit ID
const getBillByVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const db = getFirestore();
    
    const visitDoc = await db.collection('visits').doc(visitId).get();
    
    if (!visitDoc.exists) {
      logBusiness('warn', 'Visit not found', { visitId, requestedBy: req.user.uid });
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visitData = visitDoc.data();
    
    if (!visitData.billing) {
      logBusiness('warn', 'No bill found for visit', { visitId, requestedBy: req.user.uid });
      return res.status(404).json({ error: 'No bill found for this visit' });
    }

    logBusiness('info', 'Bill retrieved successfully', { 
      visitId, 
      requestedBy: req.user.uid 
    });

    res.json({ 
      bill: visitData.billing,
      visit: {
        id: visitDoc.id,
        token: visitData.token,
        visitDate: visitData.visitDate,
        status: visitData.status
      }
    });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve bill', { 
      visitId: req.params.visitId, 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve bill' });
  }
};

// Get all bills for a patient
const getPatientBills = async (req, res) => {
  try {
    const { patientId } = req.params;
    const db = getFirestore();
    
    // Verify patient exists
    const patientDoc = await db.collection('patients').doc(patientId).get();
    if (!patientDoc.exists) {
      logBusiness('warn', 'Patient not found for bills', { patientId, requestedBy: req.user.uid });
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get all visits with bills for this patient
    const visitsSnapshot = await db.collection('visits')
      .where('patientId', '==', patientId)
      .where('billing', '!=', null)
      .orderBy('visitDate', 'desc')
      .get();

    const bills = [];
    visitsSnapshot.forEach(doc => {
      const visitData = doc.data();
      bills.push({
        visitId: doc.id,
        bill: visitData.billing,
        visitDate: visitData.visitDate,
        token: visitData.token
      });
    });

    logBusiness('info', 'Patient bills retrieved successfully', { 
      patientId, 
      billCount: bills.length, 
      requestedBy: req.user.uid 
    });

    res.json({ 
      patient: { id: patientDoc.id, ...patientDoc.data() },
      bills 
    });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve patient bills', { 
      patientId: req.params.patientId, 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve patient bills' });
  }
};

// Get all completed visits (with prescriptions) for billing
const getCompletedVisits = async (req, res) => {
  try {
    const db = getFirestore();
    
    const visitsSnapshot = await db.collection('visits')
      .where('status', '==', 'completed')
      .where('billing', '==', null)
      .orderBy('visitDate', 'asc')
      .get();

    const visits = [];
    for (const doc of visitsSnapshot.docs) {
      const visitData = doc.data();
      
      // Get patient info for each visit
      const patientDoc = await db.collection('patients').doc(visitData.patientId).get();
      const patientData = patientDoc.data();
      
      visits.push({
        id: doc.id,
        ...visitData,
        patient: {
          id: patientDoc.id,
          ...patientData
        }
      });
    }

    logBusiness('info', 'Completed visits retrieved successfully', { 
      count: visits.length, 
      requestedBy: req.user.uid 
    });

    res.json({ visits });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve completed visits', { 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve completed visits' });
  }
};

// Get billing summary (total amount, count, etc.)
const getBillingSummary = async (req, res) => {
  try {
    const db = getFirestore();
    
    // Get all bills
    const visitsSnapshot = await db.collection('visits')
      .where('billing', '!=', null)
      .get();

    let totalAmount = 0;
    let billCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let todayAmount = 0;
    let todayCount = 0;

    visitsSnapshot.forEach(doc => {
      const visitData = doc.data();
      if (!visitData.billing || !visitData.billing.createdAt) return; // skip this bill

      const billAmount = visitData.billing.amount;
      
      totalAmount += billAmount;
      billCount++;
      
      // Check if bill was created today
      const billDate = visitData.billing.createdAt.toDate();
      if (billDate >= today) {
        todayAmount += billAmount;
        todayCount++;
      }
    });

    const summary = {
      totalAmount,
      totalBills: billCount,
      todayAmount,
      todayBills: todayCount
    };

    logBusiness('info', 'Billing summary retrieved successfully', { 
      summary, 
      requestedBy: req.user.uid 
    });

    res.json({ summary });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve billing summary', { 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve billing summary' });
  }
};

module.exports = {
  generateBill,
  getBillByVisit,
  getPatientBills,
  getCompletedVisits,
  getBillingSummary
}; 