import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axiosInstance from '../utils/axios';
import API_CONFIG from '../config/api';
import { toast } from 'react-hot-toast';

const SOCKET_URL = API_CONFIG.SOCKET_URL;

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');
  
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatType, setChatType] = useState('project'); // 'project' or 'private'
  const [activeRoom, setActiveRoom] = useState(null);

  // Initialize chat based on project parameter
  // In ChatPage.jsx, update the useEffect to handle different room types:
useEffect(() => {
  const initializeChat = async () => {
    try {
      const projectId = searchParams.get('project');
      const room = searchParams.get('room');
      const privateUserId = searchParams.get('private');
      const privateName = searchParams.get('name');

      if (projectId) {
        await loadProjectChat(projectId);
      } else if (room) {
        await loadGlobalChat(room);
      } else if (privateUserId) {
        await loadPrivateChat(privateUserId, privateName);
      } else {
        navigate('/chat'); // Redirect to chat hub
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  initializeChat();
}, [projectId, searchParams]);

// ✅ FIXED: Update loadGlobalChat function
const loadGlobalChat = async (room) => {
  try {
    const userResponse = await axiosInstance.get('/api/auth/profile');
    
    // ✅ FIX: Access user data correctly
    const userData = userResponse.data.data.user; // Changed from userResponse.data
    setCurrentUser(userData);

    setActiveRoom(room);
    setChatType('global');
    setProject({ title: room === 'global' ? 'Global Chat' : 'Announcements' });

    await loadMessages(room);
    initializeSocket(room);
  } catch (error) {
    console.error('❌ Error loading global chat:', error);
    toast.error('Failed to load chat');
  }
};

// ✅ FIXED: Update loadPrivateChat function
const loadPrivateChat = async (partnerId, partnerName) => {
  try {
    const userResponse = await axiosInstance.get('/api/auth/profile');
    console.log('🔍 Private chat user response:', userResponse.data);
    
    // ✅ FIX: Access user data correctly
    const userData = userResponse.data.data.user; // Changed from userResponse.data
    console.log('🔍 Private chat user data:', userData);
    
    setCurrentUser(userData);
    
    const currentUserId = userData._id; // Now correctly accessing _id
    console.log('🔍 Private chat - Current user ID:', currentUserId);
    console.log('🔍 Private chat - Partner ID:', partnerId);

    const roomId = `private_${[currentUserId, partnerId].sort().join('_')}`;
    console.log('🔍 Generated room ID:', roomId);
    
    setActiveRoom(roomId);
    setChatType('private');
    setProject({ title: `Chat with ${decodeURIComponent(partnerName)}` });

    await loadMessages(roomId);
    initializeSocket(roomId);
  } catch (error) {
    console.error('❌ Error loading private chat:', error);
    toast.error('Failed to load private chat');
  }
};


// ✅ FIXED: Update loadProjectChat function
const loadProjectChat = async (projectId) => {
  try {
    // Get current user
    const userResponse = await axiosInstance.get('/api/auth/profile');
    console.log('🔍 Full userResponse:', userResponse.data); // Debug log
    
    // ✅ FIX: Access user data correctly from the nested structure
    const userData = userResponse.data.data.user; // Changed from userResponse.data
    console.log('🔍 Extracted userData:', userData); // Debug log
    
    setCurrentUser(userData);

    // Get project details
    const projectResponse = await axiosInstance.get(`/api/projects/${projectId}`);
    const projectData = projectResponse.data;
    setProject(projectData);

    console.log('🔍 Comparing IDs:', {
      currentUserId: userData._id, // Now correctly accessing _id
      projectCreatorId: projectData.creator._id,
      isEqual: userData._id === projectData.creator._id
    });

    // ✅ FIX: Use correct user ID for comparison
    const isCreator = projectData.creator._id === userData._id;
    const isMember = projectData.teamMembers.some(member => {
      const memberId = member.userId._id || member.userId;
      console.log('🔍 Checking member:', {
        memberId,
        currentUserId: userData._id,
        isMatch: memberId === userData._id
      });
      return memberId === userData._id;
    });

    console.log('🔍 Access check:', { isCreator, isMember });

    if (!isCreator && !isMember) {
      console.log('❌ Access denied:', {
        userID: userData._id,
        creatorID: projectData.creator._id,
        teamMembers: projectData.teamMembers.map(m => m.userId._id || m.userId)
      });
      toast.error('You are not a member of this project');
      navigate('/chat');
      return;
    }

    // Rest of your existing code...
    // Process team members correctly
    const teamMemberUsers = projectData.teamMembers
      .filter(member => member.userId._id !== projectData.creator._id)
      .map(member => ({
        _id: member.userId._id,
        name: member.userId.name,
        email: member.userId.email,
        profilePicture: member.userId.profilePicture || '',
        role: member.role,
        joinedAt: member.joinedAt,
        status: member.status,
        isCreator: false
      }));

    const creatorObj = {
      _id: projectData.creator._id,
      name: projectData.creator.name,
      email: projectData.creator.email,
      profilePicture: projectData.creator.profilePicture || '',
      role: 'Project Lead',
      isCreator: true
    };

    const allMembers = [creatorObj, ...teamMemberUsers];
    setTeamMembers(allMembers);

    setActiveRoom(`project_${projectId}`);
    setChatType('project');

    await loadMessages(`project_${projectId}`);
    initializeSocket(`project_${projectId}`);

  } catch (error) {
    console.error('❌ Error loading project chat:', error);
    toast.error('Failed to load project chat');
    navigate('/chat');
  }
};

  // Load messages for a room
  const loadMessages = async (roomId) => {
    try {
      const response = await axiosInstance.get(`/api/messages/${roomId}`);
      const messages = response.data.messages || response.data;
      setMessages(messages);
      console.log(`Loaded ${messages.length} messages for room: ${roomId}`);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
      toast.success('Starting a new team chat!');
    }
  };

  // Initialize socket connection
  const initializeSocket = (roomId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required');
      navigate('/login');
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      newSocket.emit('join room', roomId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('chat message', (message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast.error('Failed to connect to chat');
    });

    setSocket(newSocket);
  };

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && activeRoom) {
      const messageData = {
        text: newMessage,
        room: activeRoom,
        timestamp: new Date().toISOString()
      };
      
      socket.emit('chat message', messageData);
      setNewMessage('');
    }
  };

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg relative">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {chatType === 'project' ? 'Project Chat' : 'Messages'}
            </h2>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                 title={isConnected ? 'Connected' : 'Disconnected'}>
            </div>
          </div>
          
          {project && (
            <div className="mt-3">
              <h3 className="font-medium text-gray-700">{project.title}</h3>
              <p className="text-sm text-gray-500">{teamMembers.length} members</p>
            </div>
          )}
        </div>

        {/* Team Members List */}
        {chatType === 'project' && teamMembers.length > 0 && (
          <div className="p-4 flex-1 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Team Members</h4>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${member.isCreator ? 'bg-purple-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm`}>
                    {member?.name && typeof member.name === 'string' && member.name.length > 0 
                      ? member.name.charAt(0).toUpperCase() 
                      : member?.email 
                        ? member.email.charAt(0).toUpperCase()
                        : '?'
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {member?.name && typeof member.name === 'string' && member.name.trim() 
                        ? member.name 
                        : member?.email 
                          ? member.email.split('@')[0] 
                          : 'Unknown User'
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.role || 'Team Member'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => navigate('/chat')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Chat Hub
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white shadow-sm p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {project ? `${project.title} - Team Chat` : 'Chat'}
              </h1>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'} • {messages.length} messages
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-16">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to {project?.title} team chat!
              </h3>
              <p className="text-gray-500 mb-6">
                This is where your team collaborates and shares updates.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-700 text-sm">
                  💡 Start by introducing yourself or sharing project updates!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message._id || index} className={`flex ${
                message.isSystemMessage 
                  ? 'justify-center' 
                  : message.sender?._id === currentUser?._id ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isSystemMessage
                    ? 'bg-gray-100 text-gray-600 text-center text-sm border-2 border-dashed border-gray-300'
                    : message.sender?._id === currentUser?._id 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'bg-white shadow-sm border'
                }`}>
                  {!message.isSystemMessage && message.sender?._id !== currentUser?._id && message.sender && (
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {message.sender.name}
                    </div>
                  )}
                  <div className={message.isSystemMessage ? 'text-xs whitespace-pre-line' : 'text-sm'}>
                    {message.text}
                  </div>
                  {!message.isSystemMessage && (
                    <div className={`text-xs mt-1 ${
                      message.sender?._id === currentUser?._id ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${project ? project.title : 'chat'}...`}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Send
            </button>
          </form>
          {!isConnected && (
            <p className="text-red-500 text-sm mt-2">
              Disconnected from server. Trying to reconnect...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;