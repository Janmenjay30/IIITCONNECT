import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { toast } from 'react-hot-toast';

const MyTeamsDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, leading, member
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const fetchMyTeams = async () => {
  try {
    setLoading(true);
    const response = await axiosInstance.get('/api/users/my-teams');
    
    // 🔍 DEBUG: Check the raw response
    // console.log('=== MY TEAMS API RESPONSE ===');
    // console.log('Raw response:', response.data);
    // console.log('Number of teams:', response.data.length);
    
    // Check each team's structure
    // response.data.forEach((team, index) => {
    //   console.log(`Team ${index}:`, {
    //     id: team._id,
    //     title: team.title,
    //     creator: team.creator,
    //     teamMembers: team.teamMembers,
    //     isCreator: team.isCreator,
    //     userRole: team.userRole
    //   });
    // });
    
    setTeams(response.data);
  } catch (error) {
    console.error('Error fetching teams:', error);
    toast.error('Failed to fetch your teams');
  } finally {
    setLoading(false);
  }
};

  const filteredTeams = teams.filter(team => {
    if (filter === 'leading') return team.isCreator;
    if (filter === 'member') return !team.isCreator;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8  ">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="mb-8 mt-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Teams</h1>
          <p className="text-gray-600">Manage and track all your collaborative projects</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Projects', count: teams.length },
                { key: 'leading', label: 'Leading', count: teams.filter(t => t.isCreator).length },
                { key: 'member', label: 'Member', count: teams.filter(t => !t.isCreator).length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No teams yet' : `No teams where you're ${filter === 'leading' ? 'leading' : 'a member'}`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Join a project or create one to get started!' 
                : 'Join more projects to see them here.'
              }
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard key={team._id} team={team} onTeamUpdate={fetchMyTeams} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Team Card Component
const TeamCard = ({ team, onTeamUpdate }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{team.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                team.isCreator ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {team.userRole}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                {team.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {team.description || 'No description available'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{team.memberCount}</div>
            <div className="text-xs text-gray-500">Team Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {team.techStack?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Technologies</div>
          </div>
        </div>

        {/* Tech Stack */}
        {team.techStack && team.techStack.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {team.techStack.slice(0, 3).map((tech, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
              {team.techStack.length > 3 && (
                <span className="text-gray-500 text-xs">+{team.techStack.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/projects/${team._id}`)}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            View Project
          </button>
          <button
            onClick={() => navigate(`/chat?project=${team._id}`)}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200"
          >
            Team Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyTeamsDashboard;