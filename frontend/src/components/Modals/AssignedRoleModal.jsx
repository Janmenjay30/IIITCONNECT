// components/AssignRoleModal.js

import React, { useState, useEffect } from 'react';

const AssignRoleModal = ({ isOpen, onClose, onSubmit, applicantName, loading }) => {
  const [role, setRole] = useState('');

  // Clear the role input when the modal opens for a new user
  useEffect(() => {
    if (isOpen) {
      setRole('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role.trim()) {
      onSubmit(role);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md m-4 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Assign Role to {applicantName}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Frontend Developer, UI/UX Designer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !role.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : 'Confirm & Accept'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignRoleModal;