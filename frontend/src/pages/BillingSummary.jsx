import React, { useEffect, useState } from 'react';
import { billingAPI } from '../services/api';
import toast from 'react-hot-toast';

const BillingSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await billingAPI.getSummary();
      setSummary(res.data.summary);
    } catch (error) {
      toast.error('Failed to fetch billing summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto card">
      <h2 className="text-xl font-bold mb-4">Billing Summary</h2>
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : !summary ? (
        <div className="text-center py-8 text-gray-500">No summary available.</div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Total Bills:</span>
            <span>{summary.totalBills}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Amount:</span>
            <span>${summary.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Today's Bills:</span>
            <span>{summary.todayBills}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Today's Revenue:</span>
            <span>${summary.todayAmount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSummary; 