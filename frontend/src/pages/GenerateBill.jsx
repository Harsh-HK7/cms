import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billingAPI } from '../services/api';
import toast from 'react-hot-toast';

const GenerateBill = () => {
  const { visitId } = useParams();
  const [visit, setVisit] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVisit();
  }, [visitId]);

  const fetchVisit = async () => {
    setLoading(true);
    try {
      // For simplicity, fetch all completed visits and find this one
      const res = await billingAPI.getCompleted();
      const found = res.data.visits.find(v => v.id === visitId);
      setVisit(found);
    } catch (error) {
      toast.error('Failed to fetch visit info');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!amount) {
        toast.error('Enter amount');
        setSubmitting(false);
        return;
      }
      await billingAPI.generate({
        visitId,
        amount: Number(amount),
        description,
      });
      toast.success('Bill generated!');
      navigate('/completed-visits');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto card">
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : !visit ? (
        <div className="text-center py-8 text-gray-500">Visit not found.</div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-2">Generate Bill</h2>
          <div className="mb-4 text-sm text-gray-600">
            <span>Patient: {visit.patient?.name}</span> | <span>Token: {visit.token}</span>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium mb-1">Amount</label>
              <input type="number" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} required min="1" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Description (optional)</label>
              <input type="text" className="input-field" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Generate Bill'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default GenerateBill; 