const { verifyIdToken, getUserRole } = require('../services/firebase');
const { logAuth } = require('../services/logger');

// Middleware to verify Firebase ID token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logAuth('warn', 'No token provided in request');
      return res.status(401).json({ error: 'Access token required' });
    }

    const decodedToken = await verifyIdToken(token);
    req.user = decodedToken;
    
    logAuth('info', 'Token authenticated successfully', { uid: decodedToken.uid });
    next();
  } catch (error) {
    logAuth('error', 'Token authentication failed', { error: error.message });
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user has required role
const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userRole = await getUserRole(req.user.uid);
      
      if (!userRole) {
        logAuth('warn', 'User role not found', { uid: req.user.uid });
        return res.status(403).json({ error: 'User role not found' });
      }

      if (userRole !== requiredRole) {
        logAuth('warn', 'Insufficient permissions', { 
          uid: req.user.uid, 
          userRole, 
          requiredRole 
        });
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.userRole = userRole;
      logAuth('info', 'Role verification successful', { 
        uid: req.user.uid, 
        role: userRole 
      });
      next();
    } catch (error) {
      logAuth('error', 'Role verification failed', { 
        uid: req.user.uid, 
        error: error.message 
      });
      return res.status(500).json({ error: 'Failed to verify user role' });
    }
  };
};

// Middleware to check if user is doctor
const requireDoctor = requireRole('doctor');

// Middleware to check if user is receptionist
const requireReceptionist = requireRole('receptionist');

// Middleware to check if user is either doctor or receptionist
const requireStaff = async (req, res, next) => {
  try {
    const userRole = await getUserRole(req.user.uid);
    
    if (!userRole) {
      logAuth('warn', 'User role not found', { uid: req.user.uid });
      return res.status(403).json({ error: 'User role not found' });
    }

    if (userRole !== 'doctor' && userRole !== 'receptionist') {
      logAuth('warn', 'Invalid user role', { 
        uid: req.user.uid, 
        userRole 
      });
      return res.status(403).json({ error: 'Invalid user role' });
    }

    req.userRole = userRole;
    logAuth('info', 'Staff verification successful', { 
      uid: req.user.uid, 
      role: userRole 
    });
    next();
  } catch (error) {
    logAuth('error', 'Staff verification failed', { 
      uid: req.user.uid, 
      error: error.message 
    });
    return res.status(500).json({ error: 'Failed to verify user role' });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireDoctor,
  requireReceptionist,
  requireStaff
}; 