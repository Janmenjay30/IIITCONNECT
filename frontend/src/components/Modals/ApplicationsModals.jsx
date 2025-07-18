import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import API_URL from '../../config';
import AssignRoleModal from './AssignedRoleModal'

const ApplicationModal = ({ isOpen, onClose, applications, projectId, onApplicationHandled }) => {
  const [loading, setLoading] = useState(false);
  const [roleModalState, setRoleModalState] = useState({
    isOpen: false,
    application: null,
  });
  const token = localStorage.getItem('token');

  // Step 1: This function is called when the "Accept" button is clicked.
  // It opens the new modal to ask for a role.
  const handleAcceptClick = (application) => {
    if (!projectId) {
      toast.error('Project ID is missing');
      return;
    }
    setRoleModalState({ isOpen: true, application });
  };

  // Step 2: This function is called from within the AssignRoleModal
  // after the user confirms a role. It sends the data to the API.
  const handleConfirmAccept = async (assignedRole) => {
    const { application } = roleModalState;
    if (!projectId || !application) {
      toast.error('Project ID or Application details are missing.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/projects/${projectId}/accept-application`,
        { applicationId: application._id, assignedRole },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      toast.success(`${application.name} has been added to the team!`);
      
      setRoleModalState({ isOpen: false, application: null }); // Close the role modal
      
      if (onApplicationHandled) {
        onApplicationHandled(); // Refresh the data
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept application';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // The reject handler remains largely the same
  const handleReject = async (applicationId, applicantName) => {
    if (!projectId) {
      toast.error('Project ID is missing');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/projects/${projectId}/reject-application`,
        { applicationId },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      toast.success(`Application from ${applicantName} has been rejected.`);
      
      if (onApplicationHandled) {
        onApplicationHandled(); // Refresh the data
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject application';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  
  // Guard clause for missing projectId remains useful
  if (!projectId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-red-500 mb-4">Project ID is missing. Please try again.</p>
            <button 
              onClick={onClose} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    // Use a React Fragment to return multiple top-level elements
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto m-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Project Applications</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          {!applications || applications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No applications yet.</p>
              <p className="text-gray-400 text-sm mt-2">
                Applications will appear here when users apply to join your project.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* ... All the application detail fields like name, email, skills etc. ... */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-800">{app.name}</h3>
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                          {app.areaOfExpertise}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{app.email}</p>
                      {/* Other fields like skills, github, etc. would go here */}
                      <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Application: </span>
                          <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                          Applied on: {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAcceptClick(app)}
                        disabled={loading || roleModalState.isOpen}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        title={`Accept ${app.name}'s application`}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(app._id, app.name)}
                        disabled={loading || roleModalState.isOpen}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        title={`Reject ${app.name}'s application`}
                      >
                        {loading && !roleModalState.isOpen ? '...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Render the new modal. It will only be visible when its state is set. */}
      <AssignRoleModal
        isOpen={roleModalState.isOpen}
        onClose={() => setRoleModalState({ isOpen: false, application: null })}
        onSubmit={handleConfirmAccept}
        applicantName={roleModalState.application?.name || ''}
        loading={loading}
      />
    </>
  );
};

export default ApplicationModal;