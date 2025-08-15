import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { toast } from 'react-hot-toast';

const ChatHub = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [projectChats, setProjectChats] = useState([]);
  const [privateChats, setPrivateChats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: Add search states
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadChatData();
  }, []);

  // ✅ NEW: Search users function
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await axiosInstance.get(`/api/users/search?query=${encodeURIComponent(query)}`);
      
      // Filter out users who already have private chats
      const existingChatPartnerIds = privateChats.map(chat => chat.partnerId._id);
      const filteredResults = response.data.filter(user => 
        !existingChatPartnerIds.includes(user._id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  // ✅ NEW: Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };


  // ✅ FIXED: Corrected loadChatData function
  const loadChatData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const userResponse = await axiosInstance.get('/api/auth/profile');
      setCurrentUser(userResponse.data);

      // Get user's project chats
      const teamsResponse = await axiosInstance.get('/api/users/my-teams');
      setProjectChats(teamsResponse.data);

      // Get private chats and remove duplicates on frontend as fallback
      try {
        const privateChatsResponse = await axiosInstance.get('/api/users/private-chats');
        
        // Remove duplicates by partner ID (keep the latest)
        const uniqueChats = privateChatsResponse.data.reduce((acc, chat) => {
          const partnerId = chat.partnerId._id;
          const existingIndex = acc.findIndex(c => c.partnerId._id === partnerId);
          
          if (existingIndex === -1) {
            acc.push(chat);
          } else {
            const existing = acc[existingIndex];
            const current = chat;
            if (new Date(current.lastMessageAt || 0) > new Date(existing.lastMessageAt || 0)) {
              acc[existingIndex] = current;
            }
          }
          return acc;
        }, []);

        setPrivateChats(uniqueChats);
        
      } catch (error) {
        console.log('No private chats found');
        setPrivateChats([]);
      }

    } catch (error) {
      console.error('Error loading chat data:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

// Keep these functions as they are (using /chat route):
const openProjectChat = (projectId, projectTitle) => {
  navigate(`/chat?project=${projectId}`);
};

const openGlobalChat = () => {
  navigate(`/chat?room=global`);
};

const openAnnouncementsChat = () => {
  navigate(`/chat?room=announcements`);
};

const openPrivateChat = async (partnerId, partnerName) => {
  navigate(`/chat?private=${partnerId}&name=${encodeURIComponent(partnerName)}`);
};

const startPrivateChat = async (partnerId, partnerName) => {
  try {
    await axiosInstance.post('/api/users/private-chats', {
      partnerId: partnerId
    });

    toast.success(`Started chat with ${partnerName}`);
    navigate(`/chat?private=${partnerId}&name=${encodeURIComponent(partnerName)}`);
    
  } catch (error) {
    if (error.response?.status === 200) {
      navigate(`/chat?private=${partnerId}&name=${encodeURIComponent(partnerName)}`);
    } else {
      console.error('Error starting private chat:', error);
      toast.error('Failed to start private chat');
    }
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chat Hub</h1>
          <p className="text-gray-600 mt-2">Connect with your teams and community</p>
        </div>

        {/* Chat Categories */}
        <div className="space-y-8">
          
          {/* Global & Announcement Chats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🌍 Community Chats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Global Chat */}
              <div 
                onClick={openGlobalChat}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                    🌐
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Global Chat</h3>
                    <p className="text-sm text-gray-500">Connect with all IIIT students</p>
                    <p className="text-xs text-green-600 mt-1">🟢 Always Active</p>
                  </div>
                </div>
              </div>

              {/* Announcements Chat */}
              <div 
                onClick={openAnnouncementsChat}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                    📢
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">Announcements</h3>
                    <p className="text-sm text-gray-500">Important updates & news</p>
                    <p className="text-xs text-green-600 mt-1">🟢 Official Channel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Chats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🚀 Project Team Chats
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {projectChats.length}
              </span>
            </h2>
            
            {projectChats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectChats.map((project) => (
                  <div 
                    key={project._id}
                    onClick={() => openProjectChat(project._id, project.title)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 truncate">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {project.memberCount} members
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.isCreator 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {project.userRole}
                          </span>
                          <span className="text-xs text-green-600">🟢 Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Chats</h3>
                <p className="text-gray-500 mb-4">Join a project team to start collaborating!</p>
                <button
                  onClick={() => navigate('/explore')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Explore Projects
                </button>
              </div>
            )}
          </div>

          {/* Private Chats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                💬 Private Chats
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  {privateChats.length}
                </span>
              </h2>
              {/* ✅ NEW: Start New Chat Button */}
              <button
                onClick={() => setShowUserSearch(!showUserSearch)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <span>➕</span> Start New Chat
              </button>
            </div>

            {/* ✅ NEW: User Search Section */}
            {showUserSearch && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search users by name or email..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {searching && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 max-h-60 overflow-y-auto">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results:</h3>
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => startPrivateChat(user._id, user.name)}
                          className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-indigo-600">
                                {user.name}
                              </h4>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !searching && (
                  <div className="mt-4 text-center py-4">
                    <p className="text-gray-500">No users found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Existing Private Chats */}
            {privateChats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {privateChats.map((chat) => (
                  <div 
                    key={chat._id}
                    onClick={() => openPrivateChat(chat.partnerId._id, chat.partnerId.name)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {chat.partnerId.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                          {chat.partnerId.name}
                        </h3>
                        <p className="text-sm text-gray-500">{chat.partnerId.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Private conversation</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Private Chats</h3>
                <p className="text-gray-500 mb-4">Start a conversation with someone!</p>
                <button
                  onClick={() => setShowUserSearch(true)}
                  className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Search Users
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHub;