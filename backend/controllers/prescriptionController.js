const { getFirestore } = require('../services/firebase');
const { logBusiness } = require('../services/logger');
const Joi = require('joi');

// Validation schema for prescription
const prescriptionSchema = Joi.object({
  visitId: Joi.string().required(),
  medicines: Joi.array().items(
    Joi.object({
      name: Joi.string().required().min(2).max(100),
      dosage: Joi.string().required().min(2).max(100),
      instructions: Joi.string().required().min(2).max(500)
    })
  ).min(1).required(),
  notes: Joi.string().optional().max(1000)
});

// Add prescription to a visit
const addPrescription = async (req, res) => {
  try {
    const { error, value } = prescriptionSchema.validate(req.body);
    if (error) {
      logBusiness('warn', 'Prescription validation failed', { error: error.details[0].message });
      return res.status(400).json({ error: error.details[0].message });
    }

    const db = getFirestore();
    
    // Check if visit exists and get patient info
    const visitDoc = await db.collection('visits').doc(value.visitId).get();
    if (!visitDoc.exists) {
      logBusiness('warn', 'Visit not found for prescription', { visitId: value.visitId });
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visitData = visitDoc.data();
    
    // Check if prescription already exists
    if (visitData.prescription) {
      logBusiness('warn', 'Prescription already exists for visit', { visitId: value.visitId });
      return res.status(400).json({ error: 'Prescription already exists for this visit' });
    }

    // Create prescription data
    const prescriptionData = {
      ...value,
      createdAt: new Date(),
      createdBy: req.user.uid,
      patientId: visitData.patientId
    };

    // Update visit with prescription
    await db.collection('visits').doc(value.visitId).update({
      prescription: prescriptionData,
      status: 'completed',
      updatedAt: new Date()
    });

    // Update patient's last visit
    await db.collection('patients').doc(visitData.patientId).update({
      lastVisit: new Date()
    });

    logBusiness('info', 'Prescription added successfully', { 
      visitId: value.visitId, 
      patientId: visitData.patientId,
      createdBy: req.user.uid 
    });

    res.status(201).json({
      message: 'Prescription added successfully',
      prescription: prescriptionData
    });

  } catch (error) {
    logBusiness('error', 'Failed to add prescription', { 
      error: error.message, 
      createdBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to add prescription' });
  }
};

// Get prescription by visit ID
const getPrescriptionByVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const db = getFirestore();
    
    const visitDoc = await db.collection('visits').doc(visitId).get();
    
    if (!visitDoc.exists) {
      logBusiness('warn', 'Visit not found', { visitId, requestedBy: req.user.uid });
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visitData = visitDoc.data();
    
    if (!visitData.prescription) {
      logBusiness('warn', 'No prescription found for visit', { visitId, requestedBy: req.user.uid });
      return res.status(404).json({ error: 'No prescription found for this visit' });
    }

    logBusiness('info', 'Prescription retrieved successfully', { 
      visitId, 
      requestedBy: req.user.uid 
    });

    res.json({ 
      prescription: visitData.prescription,
      visit: {
        id: visitDoc.id,
        token: visitData.token,
        visitDate: visitData.visitDate,
        status: visitData.status
      }
    });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve prescription', { 
      visitId: req.params.visitId, 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve prescription' });
  }
};

// Get all prescriptions for a patient
const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const db = getFirestore();
    
    // Verify patient exists
    const patientDoc = await db.collection('patients').doc(patientId).get();
    if (!patientDoc.exists) {
      logBusiness('warn', 'Patient not found for prescriptions', { patientId, requestedBy: req.user.uid });
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get all visits with prescriptions for this patient
    const visitsSnapshot = await db.collection('visits')
      .where('patientId', '==', patientId)
      .where('prescription', '!=', null)
      .orderBy('visitDate', 'desc')
      .get();

    const prescriptions = [];
    visitsSnapshot.forEach(doc => {
      const visitData = doc.data();
      prescriptions.push({
        visitId: doc.id,
        prescription: visitData.prescription,
        visitDate: visitData.visitDate,
        token: visitData.token
      });
    });

    logBusiness('info', 'Patient prescriptions retrieved successfully', { 
      patientId, 
      prescriptionCount: prescriptions.length, 
      requestedBy: req.user.uid 
    });

    res.json({ 
      patient: { id: patientDoc.id, ...patientDoc.data() },
      prescriptions 
    });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve patient prescriptions', { 
      patientId: req.params.patientId, 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve patient prescriptions' });
  }
};

// Get all pending visits (without prescriptions) for doctor
const getPendingVisits = async (req, res) => {
  try {
    const db = getFirestore();
    
    const visitsSnapshot = await db.collection('visits')
      .where('status', '==', 'registered')
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

    logBusiness('info', 'Pending visits retrieved successfully', { 
      count: visits.length, 
      requestedBy: req.user.uid 
    });

    res.json({ visits });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve pending visits', { 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve pending visits' });
  }
};

module.exports = {
  addPrescription,
  getPrescriptionByVisit,
  getPatientPrescriptions,
  getPendingVisits
}; 