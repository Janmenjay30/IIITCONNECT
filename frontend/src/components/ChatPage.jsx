import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import PropTypes from "prop-types";

const SOCKET_URL = "http://localhost:5000";

const PUBLIC_CHANNELS = [
  { id: "global", name: "Global" },
  { id: "announcements", name: "Announcements" }
];

const ChatPage = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [privateChats, setPrivateChats] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [roomId, setRoomId] = useState("global");
  const [currentChat, setCurrentChat] = useState(PUBLIC_CHANNELS[0]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const myId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Fetch private chats on mount
useEffect(() => {
  const fetchPrivateChats = async () => {
    try {
      const response = await axios.get(`${SOCKET_URL}/api/users/private-chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove duplicates based on partnerId
      const uniqueChats = response.data.filter((chat, index, self) => 
        index === self.findIndex(c => c.partnerId._id === chat.partnerId._id)
      );
      
      setPrivateChats(uniqueChats);
      console.log("Private chats fetched successfully:", uniqueChats);
    } catch (err) {
      console.error("Failed to fetch private chats:", err);
      setError("Failed to load chat history");
    }
  };

  if (token) {
    fetchPrivateChats();
  }
}, [token]);

  // Socket.IO connection and event handling
  useEffect(() => {
    if (!token) {
      setError("Authentication required. Please login.");
      return;
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    socketRef.current.on("connect", () => {
      setConnectionStatus("connected");
      console.log("Connected to Socket.IO server");
      socketRef.current.emit("join room", roomId);
    });

    socketRef.current.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Connection failed. Trying to reconnect...");
      setConnectionStatus("error");
    });

    // Message handling
    socketRef.current.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Error handling
    socketRef.current.on("error", (err) => {
      console.error("Socket error:", err);
      setError(err.message);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  // Load messages when room changes
  // Load messages when room changes
useEffect(() => {
  const loadMessages = async () => {
    try {
      const response = await axios.get(`${SOCKET_URL}/api/messages/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Loaded messages for room:", roomId, response.data);
      setMessages(response.data);
    } catch (err) {
      console.error("Failed to load messages for room:", roomId, err);
      // Don't show error for new private chats that have no messages yet
      if (err.response?.status !== 404) {
        setError("Failed to load messages");
      } else {
        setMessages([]); // Clear messages for new chat
      }
    }
  };

  if (socketRef.current?.connected && roomId) {
    socketRef.current.emit("join room", roomId);
    loadMessages();
  }
}, [roomId, token]);

  // User search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim().length > 0) {
        axios.get(`${SOCKET_URL}/api/users/search?query=${search}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          setUsers(res.data);
          setShowUserList(true);
        })
        .catch(err => {
          console.error("Search failed:", err);
          setError("Failed to search users");
        });
      } else {
        setShowUserList(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, token]);

  // Message sending handler
  const handleSend = useCallback((e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (!socketRef.current?.connected) {
      setError("Not connected to chat server");
      return;
    }

    try {
      socketRef.current.emit("chat message", { 
        text: input, 
        room: roomId,
        username: myId // Assuming myId is the username or identifier
      });
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
    }
  }, [input, roomId]);

  // Channel selection handler
  const handleChannelSelect = useCallback((channel) => {
    setRoomId(channel.id);
    setCurrentChat(channel);
  }, []);

// User selection handler
const handleUserSelect = useCallback(async (user) => {
  if (!myId) {
    setError("User session expired. Please login again.");
    return;
  }
  
  const privateRoomId = [myId, user._id].sort().join("_");
  console.log("My ID:", myId);
  console.log("Selected user ID:", user._id);
  console.log("Starting private chat with room ID:", privateRoomId);
  
  setRoomId(privateRoomId);
  setCurrentChat(user);
  setShowUserList(false);
  setSearch("");

  // Check if chat already exists before adding to state
  const existingChat = privateChats.find(chat => 
    chat.partnerId._id === user._id || chat.roomId === privateRoomId
  );
  
  if (!existingChat) {
    // Update private chats list only if doesn't exist
    setPrivateChats(prev => [...prev, { 
      _id: user._id, 
      partnerId: user, 
      roomId: privateRoomId 
    }]);

    // Save to backend only if doesn't exist
    try {
      await axios.post(
        `${SOCKET_URL}/api/users/private-chats`,
        {
          partnerId: user._id,      
          roomId: privateRoomId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save chat:", err);
      // Don't show error if chat already exists
      if (err.response?.status !== 409) {
        setError("Failed to start private chat");
      }
    }
  }
}, [myId, token, privateChats]); 

  // Render methods
  
const renderMessage = (msg, idx) => (
  <div key={`${msg._id || idx}`} className="mb-2">
    <span className="font-semibold text-blue-700">
      {msg.sender?.name || "User"}: {/* Change msg.username to msg.sender.name */}
    </span>
    <span className="ml-2">{msg.text}</span>
  </div>
);

  const renderChannel = (channel) => (
    <div
      key={channel.id}
      className={`p-2 rounded cursor-pointer ${
        currentChat.id === channel.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
      }`}
      onClick={() => handleChannelSelect(channel)}
    >
      {channel.name}
    </div>
  );

  const renderUser = (chat) => ( // Changed parameter name for clarity
  <div
    key={chat._id}
    className={`p-2 rounded cursor-pointer ${
      currentChat._id === chat.partnerId._id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
    }`}
    onClick={() => handleUserSelect(chat.partnerId)} // Pass the partnerId object
  >
    {chat.partnerId.name || chat.partnerId.email}
  </div>
);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Chats</h2>
          {connectionStatus !== "connected" && (
            <div className={`text-sm ${
              connectionStatus === "error" ? "text-red-500" : "text-yellow-500"
            }`}>
              Status: {connectionStatus}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-gray-600 font-semibold mb-2">Public Channels</h3>
          {PUBLIC_CHANNELS.map(renderChannel)}

          <h3 className="text-gray-600 font-semibold mt-4 mb-2">Private Chats</h3>
          {privateChats.map(renderUser)}

          <div className="mt-4">
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user..."
            />
            {showUserList && (
              <div className="bg-white border rounded shadow mt-2">
                {users.map(user => (
                  <div
                    key={user._id}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.name} ({user.email})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800">
            {currentChat.name || currentChat.email}
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 pt-10 bg-gray-50">
          {messages.length > 0 ? (
            messages.map(renderMessage)
          ) : (
            <div className="text-gray-500 text-center mt-8">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>
        
        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={connectionStatus !== "connected"}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
            disabled={!input.trim() || connectionStatus !== "connected"}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

ChatPage.propTypes = {
  // Add prop types if needed
};

export default ChatPage;