import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import { Link } from "react-router-dom";
import ApplicationModal from "./Modals/ApplicationsModals";

const YourProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen,setModalOpen]=useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const handleViewApplications = async (projectId) => {
    setModalLoading(true);
    setModalError(null);
    setModalOpen(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/projects/${projectId}/applications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedApplications(res.data);
    } catch (err) {
      setModalError("Failed to load applications.");
      setSelectedApplications([]);
    }
    setModalLoading(false);
  };

  useEffect(() => {
    const fetchYourProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/projects/by-creator`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(response.data);
      } catch (err) {
        setError("Failed to fetch your projects.");
      }
      setLoading(false);
    };

    fetchYourProjects();
  }, []);

  return (
    
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Projects</h1>
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold text-blue-700">{project.title}</h2>
                  <p className="text-gray-600 mt-2 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags &&
                      project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-700 font-medium">
                    Applications:{" "}
                    <span className="font-bold">
                      {project.applications ? project.applications.length : 0}
                    </span>
                  </span>
                  <button
                    onClick={() => handleViewApplications(project._id)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Applications
                  </button>
                </div>
              </div>
            ))}
            <ApplicationModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              applications={selectedApplications}
              loading={modalLoading}
              error={modalError}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default YourProjects;
