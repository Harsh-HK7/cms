import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { patientAPI, prescriptionAPI, billingAPI } from '../services/api';
import toast from 'react-hot-toast';

const PatientHistory = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await patientAPI.getHistory(patientId);
      setPatient(res.data.patient);
      setVisits(res.data.visits);
    } catch (error) {
      toast.error('Failed to fetch patient history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : !patient ? (
        <div className="text-center py-8 text-gray-500">Patient not found.</div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-2">{patient.name}'s History</h2>
          <div className="mb-4 text-sm text-gray-600">
            <span>Age: {patient.age}</span> | <span>Blood Group: {patient.bloodGroup}</span> | <span>Contact: {patient.contact}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prescription</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bill</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">No visits found.</td>
                  </tr>
                ) : (
                  visits.map((visit) => (
                    <tr key={visit.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{visit.token}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(visit.visitDate.seconds * 1000).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {visit.prescription ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-500">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {visit.billing ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-500">No</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientHistory; 