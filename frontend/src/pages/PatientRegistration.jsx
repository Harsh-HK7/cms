import React, { useState } from 'react';
import { patientAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const initialState = {
  name: '',
  age: '',
  bloodGroup: '',
  contact: '',
  disease: '',
};

const bloodGroups = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const PatientRegistration = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Basic validation
      if (!form.name || !form.age || !form.bloodGroup || !form.contact || !form.disease) {
        toast.error('Please fill all fields');
        setLoading(false);
        return;
      }
      await patientAPI.register({
        ...form,
        age: Number(form.age),
      });
      toast.success('Patient registered successfully!');
      setForm(initialState);
      navigate('/patients');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto card">
      <h2 className="text-xl font-bold mb-4">Register New Patient</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Patient name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            className="input-field"
            placeholder="Age"
            min="0"
            max="150"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Blood Group</label>
          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select blood group</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact</label>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="input-field"
            placeholder="Contact number"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Disease</label>
          <input
            type="text"
            name="disease"
            value={form.disease}
            onChange={handleChange}
            className="input-field"
            placeholder="Disease/complaint"
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
    </div>
  );
};

export default PatientRegistration; 