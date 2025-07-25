import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Patient API calls
export const patientAPI = {
  register: (patientData) => api.post('/patients', patientData),
  getAll: () => api.get('/patients'),
  getById: (patientId) => api.get(`/patients/${patientId}`),
  getHistory: (patientId) => api.get(`/patients/${patientId}/history`),
  search: (query) => api.get(`/patients/search?query=${query}`),
};

// Prescription API calls
export const prescriptionAPI = {
  add: (prescriptionData) => api.post('/prescriptions', prescriptionData),
  getByVisit: (visitId) => api.get(`/prescriptions/visit/${visitId}`),
  getByPatient: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  getPending: () => api.get('/prescriptions/pending'),
};

// Billing API calls
export const billingAPI = {
  generate: (billingData) => api.post('/billing', billingData),
  getByVisit: (visitId) => api.get(`/billing/visit/${visitId}`),
  getByPatient: (patientId) => api.get(`/billing/patient/${patientId}`),
  getCompleted: () => api.get('/billing/completed'),
  getSummary: () => api.get('/billing/summary'),
};

export default api; 