import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import API_URL from "../config";

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/projects`);
        setProjects(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects");
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // Get unique tags from all projects
  const allTags = projects.reduce((tags, project) => {
    if (project.tags && Array.isArray(project.tags)) {
      project.tags.forEach(tag => tags.add(tag));
    }
    return tags;
  }, new Set());

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") {
      return matchesSearch;
    } else if (project.tags && Array.isArray(project.tags)) {
      return matchesSearch && project.tags.includes(activeFilter);
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  IIITBh Connect
                </span>
              </Link>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-6">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-blue-600"
                >
                  Projects
                </Link>
                
                {isLoggedIn && (
                  <Link 
                    to="/your-projects" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Your Projects
                  </Link>
                )}
                
                <Link 
                  to="/chat" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Messages
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <div className="relative group">
                    <button className="flex items-center text-sm font-medium text-gray-700 focus:outline-none">
                      <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {localStorage.getItem("name") ? localStorage.getItem("name").charAt(0).toUpperCase() : "U"}
                      </span>
                    </button>
                    <div className="absolute w-full h-2 bottom-0 left-0 transform translate-y-full"></div>
                    <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-250 ease-in-out">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/your-projects"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Your Projects
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Collaborate on Amazing Projects at IIIT Bhagalpur
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Find team members with the right skills or contribute your expertise to exciting projects
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/create-project"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-300 shadow-md"
                >
                  Start a Project
                </Link>
                <a
                  href="#projects"
                  className="bg-blue-700 text-white border border-blue-400 px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition duration-300 shadow-md"
                >
                  Explore Projects
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-xl">
                <h3 className="text-xl font-bold mb-4">Why Join IIITBh Connect?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Find teammates with complementary skills</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Showcase your projects to the community</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Build your portfolio with real-world projects</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="projects">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Discover Projects</h2>
          <div className="w-full md:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Tags/Categories Filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === "all"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              All Projects
            </button>
            {Array.from(allTags).map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === tag
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Project Listing */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
            {error}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:px-12 text-center md:text-left">
              <div className="md:flex md:items-center">
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    Ready to showcase your skills?
                  </h2>
                  <p className="mt-4 text-lg text-blue-100">
                    Join a project that matches your interests or start your own to build a portfolio that stands out.
                  </p>
                </div>
                <div className="mt-8 md:mt-0 md:w-1/3 md:flex md:justify-end">
                  <div className="rounded-md shadow">
                    <Link
                      to={isLoggedIn ? "/create-project" : "/register"}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
                    >
                      {isLoggedIn ? "Start Your Project" : "Sign Up Now"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">IIITBh Connect</h3>
              <p className="text-gray-600">
                A platform for IIIT Bhagalpur students to collaborate on projects and build teams.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-600 hover:text-blue-600">All Projects</Link></li>
                <li><Link to="/create-project" className="text-gray-600 hover:text-blue-600">Start a Project</Link></li>
                <li><Link to="/your-projects" className="text-gray-600 hover:text-blue-600">Your Projects</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Contact</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} IIITBH Connect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;