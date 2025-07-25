import React, { useEffect, useState } from 'react';
import { prescriptionAPI } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PendingVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingVisits();
  }, []);

  const fetchPendingVisits = async () => {
    setLoading(true);
    try {
      const res = await prescriptionAPI.getPending();
      setVisits(res.data.visits);
    } catch (error) {
      toast.error('Failed to fetch pending visits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Pending Visits</h2>
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : visits.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No pending visits.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.map((visit) => (
                <tr key={visit.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{visit.token}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{visit.patient?.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{visit.patient?.age}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{visit.patient?.contact}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(visit.visitDate.seconds * 1000).toLocaleString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Link to={`/add-prescription/${visit.id}`} className="btn-primary py-1 px-3 text-sm">Add Prescription</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingVisits; 