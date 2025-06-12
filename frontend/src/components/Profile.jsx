import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "react-hot-toast";
import { Link } from 'react-router-dom';
import API_URL from '../config';

function Profile() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');


  const Badge = ({ children, className = "" }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {  
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      // Fetch user's projects
      const projectsResponse = await axios.get(`${API_URL}/api/projects/by-creator`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      setUser({
        ...response.data,
        projects: projectsResponse.data
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to fetch profile");
      setError("Failed to fetch profile");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 mt-10 bg-white rounded-lg shadow-md">
        <div className="text-center text-red-500 p-8">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold">Error Loading Profile</h2>
          <p className="mt-2">{error}</p>
          <button 
            onClick={fetchDetails}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8">
      {/* Header Section with Cover Image */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          to="/"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition"
        >
          ← Back to Home
        </Link>
      </div>
      <div className="relative h-60 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg">
        <div className="absolute -bottom-16 left-8">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-md flex justify-center items-center">
              <span className="text-3xl font-bold text-gray-500">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User Info Section */}
      <div className="bg-white rounded-b-lg shadow-md pb-6">
        <div className="pt-20 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{user.name || "Anonymous User"}</h1>
              <p className="text-gray-600">{user.email || "No email provided"}</p>
            </div>
            <button className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200">
              Edit Profile
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Bio Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">About Me</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {user.bio || "This user hasn't added a bio yet."}
                  </p>
                </div>
                
                {/* Skills Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                  {user.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No skills listed yet</p>
                  )}
                </div>
                
                {/* Account Details */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-40">Member Since:</span>
                      <span className="text-gray-800">{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-40">Account Status:</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

{activeTab === 'projects' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Your Projects</h2>
      <Link 
        to="/create-project" 
        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Create New Project
      </Link>
    </div>
    
    {loading ? (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    ) : user.projects && user.projects.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user.projects.map((project) => (
          <div key={project._id} 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div className="p-6">
              <div className="mb-3">
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{project.title}</h3>
                <p className="text-gray-600 mb-4 overflow-hidden" 
                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {project.description}
                </p>
              </div>
              
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} className="bg-blue-50 text-blue-700 border border-blue-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {project.requiredRoles && project.requiredRoles.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Roles Needed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredRoles.map((role, index) => (
                      <Badge key={index} className="bg-indigo-100 text-indigo-800">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {formatDate(project.createdAt)}
                  </span>
                </div>
                <Link 
                  to={`/projects/${project._id}`} 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No projects yet</h3>
        <p className="mt-1 text-gray-500">Get started by creating a new project.</p>
        <Link 
          to="/create-project"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create a Project
        </Link>
      </div>
    )}
  </div>
)}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-gray-500">Your recent activity will show up here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;