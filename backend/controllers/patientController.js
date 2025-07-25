const { getFirestore } = require('../services/firebase');
const { generateToken } = require('../services/tokenGenerator');
const { logBusiness } = require('../services/logger');
const Joi = require('joi');

// Validation schemas
const patientSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  age: Joi.number().integer().min(0).max(150).required(),
  bloodGroup: Joi.string().required().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  contact: Joi.string().required().pattern(/^[0-9+\-\s()]+$/).min(10).max(15),
  disease: Joi.string().required().min(2).max(500)
});

// Register a new patient and generate token
const registerPatient = async (req, res) => {
  try {
    const { error, value } = patientSchema.validate(req.body);
    if (error) {
      logBusiness('warn', 'Patient registration validation failed', { error: error.details[0].message });
      return res.status(400).json({ error: error.details[0].message });
    }

    const db = getFirestore();
    const token = await generateToken();
    
    // Create patient document
    const patientData = {
      ...value,
      createdAt: new Date(),
      createdBy: req.user.uid,
      lastVisit: new Date()
    };

    const patientRef = await db.collection('patients').add(patientData);
    
    // Create visit record
    const visitData = {
      patientId: patientRef.id,
      token: token,
      visitDate: new Date(),
      status: 'registered', // registered, in-progress, completed
      createdBy: req.user.uid,
      prescription: null,
      billing: null
    };

    const visitRef = await db.collection('visits').add(visitData);

    logBusiness('info', 'Patient registered successfully', { 
      patientId: patientRef.id, 
      visitId: visitRef.id, 
      token,
      createdBy: req.user.uid 
    });

    res.status(201).json({
      message: 'Patient registered successfully',
      patientId: patientRef.id,
      visitId: visitRef.id,
      token: token,
      patient: patientData
    });

  } catch (error) {
    logBusiness('error', 'Failed to register patient', { 
      error: error.message, 
      createdBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to register patient' });
  }
};

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const db = getFirestore();
    const patientsSnapshot = await db.collection('patients')
      .orderBy('createdAt', 'desc')
      .get();

    const patients = [];
    patientsSnapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });

    logBusiness('info', 'Patients retrieved successfully', { 
      count: patients.length, 
      requestedBy: req.user.uid 
    });

    res.json({ patients });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve patients', { 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve patients' });
  }
};

// Get patient by ID
const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const db = getFirestore();
    
    const patientDoc = await db.collection('patients').doc(patientId).get();
    
    if (!patientDoc.exists) {
      logBusiness('warn', 'Patient not found', { patientId, requestedBy: req.user.uid });
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientData = {
      id: patientDoc.id,
      ...patientDoc.data()
    };

    logBusiness('info', 'Patient retrieved successfully', { 
      patientId, 
      requestedBy: req.user.uid 
    });

    res.json({ patient: patientData });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve patient', { 
      patientId: req.params.patientId, 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve patient' });
  }
};

// Get patient history (all visits)
const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const db = getFirestore();
    
    // Verify patient exists
    const patientDoc = await db.collection('patients').doc(patientId).get();
    if (!patientDoc.exists) {
      logBusiness('warn', 'Patient not found for history', { patientId, requestedBy: req.user.uid });
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get all visits for this patient
    const visitsSnapshot = await db.collection('visits')
      .where('patientId', '==', patientId)
      .orderBy('visitDate', 'desc')
      .get();

    const visits = [];
    visitsSnapshot.forEach(doc => {
      visits.push({
        id: doc.id,
        ...doc.data()
      });
    });

    logBusiness('info', 'Patient history retrieved successfully', { 
      patientId, 
      visitCount: visits.length, 
      requestedBy: req.user.uid 
    });

    res.json({ 
      patient: { id: patientDoc.id, ...patientDoc.data() },
      visits 
    });

  } catch (error) {
    logBusiness('error', 'Failed to retrieve patient history', { 
      patientId: req.params.patientId, 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to retrieve patient history' });
  }
};

// Search patients by name or contact
const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const db = getFirestore();
    const patientsSnapshot = await db.collection('patients')
      .orderBy('name')
      .startAt(query)
      .endAt(query + '\uf8ff')
      .limit(10)
      .get();

    const patients = [];
    patientsSnapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });

    logBusiness('info', 'Patient search completed', { 
      query, 
      results: patients.length, 
      requestedBy: req.user.uid 
    });

    res.json({ patients });

  } catch (error) {
    logBusiness('error', 'Failed to search patients', { 
      query: req.query.query, 
      error: error.message, 
      requestedBy: req.user.uid 
    });
    res.status(500).json({ error: 'Failed to search patients' });
  }
};

module.exports = {
  registerPatient,
  getAllPatients,
  getPatientById,
  getPatientHistory,
  searchPatients
}; 