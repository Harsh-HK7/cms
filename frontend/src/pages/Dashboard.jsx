import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { patientAPI, prescriptionAPI, billingAPI } from '../services/api';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Stethoscope, 
  DollarSign, 
  BarChart3,
  ClipboardList,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { userRole, isDoctor, isReceptionist } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingVisits: 0,
    completedVisits: 0,
    totalBills: 0,
    todayBills: 0,
    todayAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get patients count
      const patientsResponse = await patientAPI.getAll();
      const totalPatients = patientsResponse.data.patients.length;

      let pendingVisits = 0;
      let completedVisits = 0;
      let totalBills = 0;
      let todayBills = 0;
      let todayAmount = 0;

      if (isDoctor) {
        // Get pending visits for doctor
        const pendingResponse = await prescriptionAPI.getPending();
        pendingVisits = pendingResponse.data.visits.length;
      }

      if (isReceptionist) {
        // Get completed visits for receptionist
        const completedResponse = await billingAPI.getCompleted();
        completedVisits = completedResponse.data.visits.length;

        // Get billing summary
        const summaryResponse = await billingAPI.getSummary();
        const summary = summaryResponse.data.summary;
        totalBills = summary.totalBills;
        todayBills = summary.todayBills;
        todayAmount = summary.todayAmount;
      }

      setStats({
        totalPatients,
        pendingVisits,
        completedVisits,
        totalBills,
        todayBills,
        todayAmount
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'View Patients',
      description: 'Browse all registered patients',
      icon: Users,
      href: '/patients',
      color: 'bg-blue-500',
      roles: ['doctor', 'receptionist']
    },
    {
      title: 'Register Patient',
      description: 'Add a new patient to the system',
      icon: UserPlus,
      href: '/register-patient',
      color: 'bg-green-500',
      roles: ['receptionist']
    },
    {
      title: 'Pending Visits',
      description: 'View patients waiting for consultation',
      icon: Clock,
      href: '/pending-visits',
      color: 'bg-yellow-500',
      roles: ['doctor']
    },
    {
      title: 'Completed Visits',
      description: 'View visits ready for billing',
      icon: ClipboardList,
      href: '/completed-visits',
      color: 'bg-purple-500',
      roles: ['receptionist']
    },
    {
      title: 'Billing Summary',
      description: 'View financial reports',
      icon: BarChart3,
      href: '/billing-summary',
      color: 'bg-indigo-500',
      roles: ['receptionist']
    },
    {
      title: 'Generate Bill',
      description: 'Select a completed visit to generate a bill',
      icon: DollarSign,
      href: '/completed-visits',
      color: 'bg-pink-500',
      roles: ['receptionist']
    }
  ];

  const filteredQuickActions = quickActions.filter(action => 
    action.roles.includes(userRole)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        {isDoctor && (
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Visits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingVisits}</p>
              </div>
            </div>
          </div>
        )}

        {isReceptionist && (
          <>
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Visits</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedVisits}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.todayAmount}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuickActions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`p-3 ${action.color} rounded-lg`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span>System is running smoothly</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
            <span>All services are operational</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
            <span>Database connection stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 