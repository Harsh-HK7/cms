import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Users, 
  UserPlus, 
  Clock, 
  FileText, 
  DollarSign, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Stethoscope,
  ClipboardList
} from 'lucide-react';

const Layout = () => {
  const { user, userRole, signOut, isDoctor, isReceptionist } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['doctor', 'receptionist'] },
    { name: 'Patients', href: '/patients', icon: Users, roles: ['doctor', 'receptionist'] },
    { name: 'Register Patient', href: '/register-patient', icon: UserPlus, roles: ['receptionist'] },
    { name: 'Pending Visits', href: '/pending-visits', icon: Clock, roles: ['doctor'] },
    { name: 'Add Prescription', href: '/add-prescription', icon: Stethoscope, roles: ['doctor'] },
    { name: 'Completed Visits', href: '/completed-visits', icon: ClipboardList, roles: ['receptionist'] },
    { name: 'Generate Bill', href: '/completed-visits', icon: DollarSign, roles: ['receptionist'] },
    { name: 'Billing Summary', href: '/billing-summary', icon: BarChart3, roles: ['receptionist'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg flex flex-col py-8 px-6 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo and Clinic Name */}
        <div className="flex items-center mb-10">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">D</div>
          <h1 className="ml-4 text-2xl font-bold text-gray-900">Direction</h1>
        </div>
        {/* User info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700 mb-2">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="text-base font-medium text-gray-700">{user?.email}</div>
          <div className="text-xs text-gray-400 capitalize">{userRole}</div>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        {/* Sign out button */}
        <div className="mt-8">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200 border border-gray-200"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 flex items-center justify-center lg:justify-end">
            <h2 className="text-lg font-semibold text-gray-900 lg:hidden">
              Direction Clinic
            </h2>
          </div>
        </div>
        {/* Page content */}
        <main className="flex-1 flex flex-col items-center justify-start p-6 sm:p-10 bg-gray-50 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 