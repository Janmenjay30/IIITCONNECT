import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import API_URL from '../config';

const TeamManagementPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTeamData();
    fetchUserData();
  }, [projectId]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchTeamData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects/${projectId}/team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamData(response.data);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/projects/${projectId}/remove-member`,
        { memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`${memberName} has been removed from the team`);
      fetchTeamData(); // Refresh team data
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project?')) {
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/projects/${projectId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('You have left the project');
      navigate('/my-teams');
    } catch (error) {
      console.error('Error leaving project:', error);
      toast.error(error.response?.data?.message || 'Failed to leave project');
    }
  };

  const handleUpdateRole = async (memberId, currentRole) => {
    const newRole = prompt(`Update role for this member (current: ${currentRole}):`);
    if (!newRole || newRole === currentRole) return;

    try {
      await axios.put(
        `${API_URL}/api/projects/${projectId}/update-role`,
        { memberId, newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Role updated successfully');
      fetchTeamData(); // Refresh team data
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const isCreator = user && teamData && teamData.creator._id === user._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {teamData.projectTitle}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Created by: {teamData.creator.name}</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {teamData.projectStatus}
                </span>
                <span>{teamData.currentTeamSize}/{teamData.maxTeamSize} members</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!isCreator && (
                <button
                  onClick={handleLeaveProject}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Leave Project
                </button>
              )}
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                View Project
              </button>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Team Members</h2>
          
          <div className="grid gap-4">
            {teamData.teamMembers.map((member) => (
              <div key={member._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {member.userId.name}
                        {member.userId._id === teamData.creator._id && (
                          <span className="ml-2 bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                            Creator
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600">{member.userId.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-green-100 text-green-600 text-sm px-2 py-1 rounded-full">
                          {member.role}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined: {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {isCreator && member.userId._id !== teamData.creator._id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateRole(member.userId._id, member.role)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Update Role
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.userId._id, member.userId.name)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {teamData.currentTeamSize < teamData.maxTeamSize && (
            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-600">
                {teamData.maxTeamSize - teamData.currentTeamSize} more spots available
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Share your project to get more applications!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagementPage;