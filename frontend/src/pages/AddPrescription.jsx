import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { prescriptionAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddPrescription = () => {
  const { visitId } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', instructions: '' }]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVisit();
  }, [visitId]);

  const fetchVisit = async () => {
    setLoading(true);
    try {
      // For simplicity, fetch all pending visits and find this one
      const res = await prescriptionAPI.getPending();
      const found = res.data.visits.find(v => v.id === visitId);
      setVisit(found);
    } catch (error) {
      toast.error('Failed to fetch visit info');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineChange = (idx, field, value) => {
    setMedicines((prev) => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const addMedicine = () => {
    setMedicines((prev) => [...prev, { name: '', dosage: '', instructions: '' }]);
  };

  const removeMedicine = (idx) => {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (medicines.some(m => !m.name || !m.dosage || !m.instructions)) {
        toast.error('Fill all medicine fields');
        setSubmitting(false);
        return;
      }
      await prescriptionAPI.add({
        visitId,
        medicines,
        notes,
      });
      toast.success('Prescription added!');
      navigate('/pending-visits');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto card">
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : !visit ? (
        <div className="text-center py-8 text-gray-500">Visit not found.</div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-2">Add Prescription</h2>
          <div className="mb-4 text-sm text-gray-600">
            <span>Patient: {visit.patient?.name}</span> | <span>Token: {visit.token}</span>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {medicines.map((med, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div>
                  <label className="block text-xs font-medium mb-1">Medicine Name</label>
                  <input type="text" className="input-field" value={med.name} onChange={e => handleMedicineChange(idx, 'name', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Dosage</label>
                  <input type="text" className="input-field" value={med.dosage} onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Instructions</label>
                  <input type="text" className="input-field" value={med.instructions} onChange={e => handleMedicineChange(idx, 'instructions', e.target.value)} required />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  {medicines.length > 1 && (
                    <button type="button" className="btn-danger px-2 py-1 text-xs mr-2" onClick={() => removeMedicine(idx)}>Remove</button>
                  )}
                  {idx === medicines.length - 1 && (
                    <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={addMedicine}>Add Medicine</button>
                  )}
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium mb-1">Notes (optional)</label>
              <textarea className="input-field" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Add Prescription'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AddPrescription; 