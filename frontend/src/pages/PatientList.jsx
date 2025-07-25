import React, { useEffect, useState } from 'react';
import { patientAPI } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientAPI.getAll();
      setPatients(res.data.patients);
      setSearchResults(res.data.patients);
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length < 2) {
      setSearchResults(patients);
      return;
    }
    try {
      const res = await patientAPI.search(value);
      setSearchResults(res.data.patients);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Patients</h2>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          className="input-field w-64"
          placeholder="Search by name or contact..."
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disease</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">History</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {searchResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">No patients found.</td>
                </tr>
              ) : (
                searchResults.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{patient.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{patient.age}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{patient.bloodGroup}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{patient.contact}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{patient.disease}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Link to={`/patients/${patient.id}/history`} className="text-primary-600 hover:underline">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientList; 