import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

// Icons
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const ApplicationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Badge component to replace shadcn's Badge
const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const ProjectCard = ({ project, onViewApplications }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{project.title}</h3>
          <p className="text-gray-600 mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
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
          <button
            onClick={() => onViewApplications(project._id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <ApplicationIcon />
            <span>Applications</span>
            <span className="inline-flex items-center justify-center w-6 h-6 ml-1 text-xs font-semibold bg-blue-800 text-white rounded-full">
              {project.applications ? project.applications.length : 0}
            </span>
          </button>
          
          <Link 
            to={`/projects/${project._id}`} 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

const ApplicationModal = ({ applications, onClose, projectTitle }) => {
  // Group skills for better display
  const formatSkills = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            Applications for "{projectTitle}"
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 max-h-[calc(80vh-8rem)]">
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No applications yet</p>
              <p className="text-gray-400 mt-2">Applications will appear here when candidates apply</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => (
                <div key={app._id} className="bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{app.name}</h4>
                      <p className="text-gray-600">{app.email}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {app.areaOfExpertise}
                    </Badge>
                  </div>
                  
                  {app.skills && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Skills:</h5>
                      <div className="flex flex-wrap gap-2">
                        {formatSkills(app.skills).map((skill, i) => (
                          <Badge key={i} className="bg-gray-100 text-gray-800 border border-gray-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded">
                      Contact Applicant
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function YourProjects() {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplications, setShowApplications] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  const handleShowApplications = async (projectId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/projects/${projectId}/applications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setApplications(response.data);
      setSelectedProject(projects.find(p => p._id === projectId));
      setShowApplications(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError("Failed to load applications");
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/projects/by-creator", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProjects(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
              <p className="text-gray-600 mt-1">Manage your projects and view applications</p>
            </div>
          </div>
          
          <button
            onClick={handleCreateProject}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
          >
            Create New Project
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : (
          <>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard 
                    key={project._id} 
                    project={project} 
                    onViewApplications={handleShowApplications} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <svg 
                  className="mx-auto h-16 w-16 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
                <p className="mt-2 text-gray-500">Get started by creating your first project</p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateProject}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
                  >
                    Create a Project
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {showApplications && selectedProject && (
          <ApplicationModal
            applications={applications}
            onClose={() => setShowApplications(false)}
            projectTitle={selectedProject.title}
          />
        )}
      </div>
    </div>
  );
}

export default YourProjects;