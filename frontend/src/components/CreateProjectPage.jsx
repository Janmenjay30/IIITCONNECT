import React, { useState } from "react";

import { useNavigate } from "react-router-dom";


const CreateProjectPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredRoles: [],
    tags: [],
  });


  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRolesChange = (e) => {
    const roles = e.target.value.split(",").map((role) => role.trim());
    setFormData({ ...formData, requiredRoles: roles });
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setFormData({ ...formData, tags });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError(null); 
    try{
    
      const response = await axiosInstance.post('/api/projects', formData);
      console.log("response is ",response);
      if (response.status === 201) {
        console.log("Project Created:", response.data);
        // navigate('/');
        navigate(`/project/${response.data.project._id}`);
      } else {
        console.error("Project Creation Failed:", response.data);
        setError(response.data.message || "Project creation failed.");
      }

    }  catch(err){
      console.error("Error creating project:", err);
      setError(err?.response?.data?.message || "An unexpected error occurred.");
    }
    navigate('/');
    console.log("Project Created:", formData);
    
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Create a New Project</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
          {/* Project Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter project title"
              required
            />
          </div>

          {/* Project Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows="5"
              placeholder="Describe your project"
              required
            />
          </div>

          {/* Required Roles */}
          <div className="mb-6">
            <label htmlFor="requiredRoles" className="block text-gray-700 font-semibold mb-2">
              Required Roles (comma-separated)
            </label>
            <input
              type="text"
              id="requiredRoles"
              name="requiredRoles"
              value={formData.requiredRoles.join(", ")}
              onChange={handleRolesChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g., UI/UX Designer, Backend Developer"
              required
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-gray-700 font-semibold mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags.join(", ")}
              onChange={handleTagsChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g., Web App, AI, Mobile"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;