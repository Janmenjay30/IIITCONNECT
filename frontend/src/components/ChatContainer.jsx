import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatHub from './ChatHub';
import ChatPage from './ChatPage';

const ChatContainer = () => {
  const [searchParams] = useSearchParams();
  
  // Check if any chat room parameters exist
  const hasRoomParams = searchParams.get('project') || 
                       searchParams.get('room') || 
                       searchParams.get('private');

  // If room parameters exist, show ChatPage, otherwise show ChatHub
  return hasRoomParams ? <ChatPage /> : <ChatHub />;
};

export default ChatContainer;