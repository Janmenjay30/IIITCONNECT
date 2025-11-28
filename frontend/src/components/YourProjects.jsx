import React, { useEffect, useState } from "react";


import { Link, useNavigate } from "react-router-dom";
import ApplicationModal from "./Modals/ApplicationsModals";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axios";
import TaskManagement from "./TaskManagement";

const YourProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskProjectId, setTaskProjectId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();


  const handleViewApplications = async (projectId) => {
    setModalLoading(true);
    setModalError(null);
    setModalOpen(true);
    setSelectedProjectId(projectId);
    try {
      
      const res = await axiosInstance.get(`/api/projects/${projectId}/applications`);
      setSelectedApplications(res.data);
    } catch (err) {
      setModalError("Failed to load applications.");
      setSelectedApplications([]);
    }
    setModalLoading(false);
  };

  const handleApplicationHandled = async () => {
    // Refresh applications after accept/reject
    if (selectedProjectId) {
      await handleViewApplications(selectedProjectId);
    }
    // Refresh the projects list to update application counts
    fetchYourProjects();
  };

  const fetchYourProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      
      const response = await axiosInstance.get(`/api/projects/by-creator`);
      setProjects(response.data);
      console.log("Fetched projects:", response.data);
    } catch (err) {
      setError("Failed to fetch your projects.");
    }
    setLoading(false);
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/api/projects/${projectId}`);
      fetchYourProjects(); // Refresh the list
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  const toggleProjectExpansion = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleOpenTaskModal = (projectId) => {
    setTaskProjectId(projectId);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setTaskProjectId(null);
    fetchYourProjects(); // Refresh to update task counts
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/profile');
      setCurrentUserId(response.data.data?.user?._id || response.data._id);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  useEffect(() => {
    fetchYourProjects();
    fetchCurrentUser();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Projects</h1>
          <Link
            to="/create-project"
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Create New Project
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
            <p className="mt-2 text-gray-500">You haven't created any projects yet.</p>
            <Link
              to="/create-project"
              className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Project Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-semibold text-blue-700">
                          {project.title}
                        </h2>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectStatus)}`}>
                          {project.projectStatus || 'planning'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Team: {project.currentTeamSize || 1}/{project.maxTeamSize || 10}</span>
                        <span>Applications: {project.applications ? project.applications.length : 0}</span>
                        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => toggleProjectExpansion(project._id)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
                      >
                        {expandedProject === project._id ? 'Less' : 'More'}
                      </button>
                      <button
                        onClick={() => handleOpenTaskModal(project._id)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center gap-1"
                        title="Manage Tasks"
                      >
                        📋 Tasks
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${project._id}/team`)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Team
                      </button>
                      <button
                        onClick={() => handleViewApplications(project._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Applications ({project.applications ? project.applications.length : 0})
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project._id, project.title)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Project Details */}
                {expandedProject === project._id && (
                  <div className="p-6 bg-gray-50">
                    {/* Quick Action Buttons */}
                    <div className="mb-6 flex gap-3 flex-wrap">
                      <button
                        onClick={() => handleOpenTaskModal(project._id)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md flex items-center gap-2 font-semibold"
                      >
                        📋 Assign Task to Team Members
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${project._id}/team`)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center gap-2 font-semibold"
                      >
                        👥 Manage Team
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 font-semibold"
                      >
                        📄 View Full Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Required Roles */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Required Roles</h3>
                        {project.requiredRoles && project.requiredRoles.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {project.requiredRoles.map((role, index) => (
                              <span
                                key={index}
                                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No specific roles defined</p>
                        )}
                      </div>

                      {/* Tags */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Technologies</h3>
                        {project.tags && project.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No technologies specified</p>
                        )}
                      </div>

                      {/* Team Members */}
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Team Members</h3>
                       
                        {project.teamMembers && project.teamMembers.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {project.teamMembers.map((member, index) => (
                              <div key={member._id || index} className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {member.userId?.name?.charAt(0)?.toUpperCase() || 
                                    member.userId?.charAt(0)?.toUpperCase() || // Fallback if userId is just a string
                                    '?'}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {member.userId?.name || 
                                      (typeof member.userId === 'string' ? 'User ID: ' + member.userId.substring(0, 8) : 'Unknown User')}
                                    </p>
                                    <p className="text-xs text-gray-500">{member.role}</p>
                                    <p className="text-xs text-gray-400">
                                      {member.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No team members yet</p>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div className="md:col-span-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-lg border text-center">
                            <p className="text-2xl font-bold text-blue-600">{project.applications?.length || 0}</p>
                            <p className="text-sm text-gray-500">Pending Applications</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border text-center">
                            <p className="text-2xl font-bold text-green-600">{project.currentTeamSize || 1}</p>
                            <p className="text-sm text-gray-500">Team Members</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border text-center">
                            <p className="text-2xl font-bold text-purple-600">{(project.maxTeamSize || 10) - (project.currentTeamSize || 1)}</p>
                            <p className="text-sm text-gray-500">Open Spots</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border text-center">
                            <p className="text-2xl font-bold text-orange-600">{project.tasks?.length || 0}</p>
                            <p className="text-sm text-gray-500">Tasks</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Application Modal */}
        <ApplicationModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedApplications([]);
            setSelectedProjectId(null);
          }}
          applications={selectedApplications}
          projectId={selectedProjectId}
          onApplicationHandled={handleApplicationHandled}
          loading={modalLoading}
          error={modalError}
        />

        {/* Task Management Modal */}
        {showTaskModal && taskProjectId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">📋 Task Management</h2>
                <button
                  onClick={handleCloseTaskModal}
                  className="text-white hover:text-gray-200 text-3xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <TaskManagement
                  projectId={taskProjectId}
                  isCreator={true}
                  currentUserId={currentUserId}
                />
              </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
                <button
                  onClick={handleCloseTaskModal}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourProjects;